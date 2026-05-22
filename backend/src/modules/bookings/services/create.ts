import prisma from '../../../config/prisma';
import redis from '../../../config/redis';
import { AppError } from '../../../shared/AppError';
import { bookingsCreatedTotal, bookingsFailedTotal, seatLockContentionTotal } from '../../../config/metrics';
import { getBookingRules } from '../../../config/runtimeSettings';
import type { CreateBookingInput } from '../validation';
import { lockAndValidateSeats, updateSeatsStatus } from './helpers';

const SEAT_LOCK_TTL_SEC = 15;
const ATOMIC_LOCK_SCRIPT = `
local ttl = tonumber(ARGV[1])
for i = 1, #KEYS do
  if redis.call('EXISTS', KEYS[i]) == 1 then return i end
end
for i = 1, #KEYS do redis.call('SET', KEYS[i], '1', 'EX', ttl) end
return 0
`;

async function acquireSeatLocks(eventId: number, seatIds: number[]): Promise<string[]> {
  const keys = seatIds.map((id) => `seat-lock:${eventId}:${id}`);
  const result = await redis.eval(ATOMIC_LOCK_SCRIPT, keys.length, ...keys, String(SEAT_LOCK_TTL_SEC));
  if (Number(result) !== 0) {
    seatLockContentionTotal.inc();
    throw new AppError('Một hoặc nhiều ghế đang được người khác đặt, vui lòng thử lại', 409, 'SEATS_UNAVAILABLE');
  }
  return keys;
}

export async function createBooking(userId: number, input: CreateBookingInput) {
  const rules = await getBookingRules();
  if (input.seat_ids.length > rules.maxTicketsPerBooking) {
    throw AppError.badRequest(`Tối đa ${rules.maxTicketsPerBooking} vé cho mỗi giao dịch`, 'MAX_TICKETS_PER_BOOKING');
  }
  const lockKeys = await acquireSeatLocks(input.event_id, input.seat_ids);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const events = await tx.$queryRaw<Array<{ id: number; status: string; event_date: Date }>>`
        SELECT id, status, event_date FROM events WHERE id = ${input.event_id} FOR UPDATE
      `;
      const event = events[0];
      if (!event) throw AppError.notFound('Sự kiện không tồn tại', 'EVENT_NOT_FOUND');
      if (event.status !== 'published') throw AppError.conflict('Sự kiện chưa mở bán', 'EVENT_NOT_BOOKABLE');
      if (new Date(event.event_date) <= new Date()) {
        throw AppError.conflict('Sự kiện đã diễn ra hoặc đã đóng bán', 'EVENT_NOT_BOOKABLE');
      }
      const seatRows = await lockAndValidateSeats(tx, input.seat_ids, input.event_id);
      const subtotal = seatRows.reduce((sum, seat) => sum + Number(seat.price), 0);
      const expiresAt = new Date(Date.now() + rules.ticketHoldMinutes * 60 * 1000);
      const booking = await tx.bookings.create({
        data: {
          user_id: userId,
          event_id: input.event_id,
          promo_code_id: null,
          discount_amount: 0,
          total_amount: subtotal,
          expires_at: expiresAt,
          booking_seats: {
            create: seatRows.map((seat) => ({ seat_id: seat.id, price: seat.price })),
          },
        },
      });
      await updateSeatsStatus(tx, input.seat_ids, 'locked', userId);
      return { booking, subtotal, expiresAt };
    });
    bookingsCreatedTotal.inc({ event_id: String(input.event_id) });
    return {
      id: result.booking.id,
      event_id: input.event_id,
      seat_ids: input.seat_ids,
      subtotal: result.subtotal,
      discount_amount: 0,
      total_amount: result.subtotal,
      promo_code: null,
      status: 'pending',
      expires_at: result.expiresAt.toISOString(),
      hold_minutes: rules.ticketHoldMinutes,
    };
  } catch (err) {
    bookingsFailedTotal.inc({ reason: err instanceof AppError ? err.code : 'UNKNOWN' });
    throw err;
  } finally {
    if (lockKeys.length > 0) redis.del(...lockKeys).catch(() => {});
  }
}
