import { ResultSetHeader } from 'mysql2';
import pool from '../../../config/database';
import redis from '../../../config/redis';
import { AppError } from '../../../shared/AppError';
import {
  bookingsCreatedTotal,
  bookingsFailedTotal,
  seatLockContentionTotal,
} from '../../../config/metrics';
import { consumeGrant } from '../../queue/service';
import type { CreateBookingInput } from '../validation';
import {
  applyPromoCode,
  assertEventCanAcceptBooking,
  assertUniqueSeatIds,
  lockAndValidateSeats,
  updateSeatsStatus,
} from './helpers';

const SEAT_LOCK_TTL_SEC = 15;

const ATOMIC_LOCK_SCRIPT = `
local ttl = tonumber(ARGV[1])
for i = 1, #KEYS do
  if redis.call('EXISTS', KEYS[i]) == 1 then
    return i
  end
end
for i = 1, #KEYS do
  redis.call('SET', KEYS[i], '1', 'EX', ttl)
end
return 0
`;

async function acquireSeatLocks(eventId: number, seatIds: number[]): Promise<string[]> {
  const keys = seatIds.map((id) => `seat-lock:${eventId}:${id}`);
  const result = await redis.eval(
    ATOMIC_LOCK_SCRIPT,
    keys.length,
    ...keys,
    String(SEAT_LOCK_TTL_SEC),
  );

  if (Number(result) !== 0) {
    seatLockContentionTotal.inc();
    throw new AppError(
      'Mot hoac nhieu ghe dang duoc nguoi khac dat, vui long thu lai',
      409,
      'SEATS_UNAVAILABLE',
    );
  }

  return keys;
}

export async function createBooking(userId: number, input: CreateBookingInput) {
  assertUniqueSeatIds(input.seat_ids);

  const lockKeys = await acquireSeatLocks(input.event_id, input.seat_ids);
  let queueEnabled = false;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const event = await assertEventCanAcceptBooking(conn, input.event_id);
    queueEnabled = event.queueEnabled;

    const seatRows = await lockAndValidateSeats(conn, input.seat_ids, input.event_id);
    const subtotal = seatRows.reduce((sum, seat) => sum + Number(seat.price), 0);

    const { promoCodeId, discountAmount } = await applyPromoCode(
      conn,
      input.promo_code,
      input.event_id,
      subtotal,
    );
    const totalAmount = subtotal - discountAmount;

    const [bookingResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO bookings (user_id, event_id, promo_code_id, discount_amount, total_amount, expires_at)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [userId, input.event_id, promoCodeId, discountAmount, totalAmount],
    );
    const bookingId = bookingResult.insertId;

    const bsValues: (string | number)[] = [];
    const bsPlaceholders: string[] = [];
    for (const seat of seatRows) {
      bsPlaceholders.push('(?, ?, ?)');
      bsValues.push(bookingId, seat.id, seat.price);
    }
    await conn.execute(
      `INSERT INTO booking_seats (booking_id, seat_id, price) VALUES ${bsPlaceholders.join(', ')}`,
      bsValues,
    );

    await updateSeatsStatus(conn, input.seat_ids, 'locked', userId);

    await conn.commit();

    if (queueEnabled) {
      consumeGrant(input.event_id, userId).catch(() => { /* best-effort cleanup */ });
    }
    bookingsCreatedTotal.inc({ event_id: String(input.event_id) });

    return {
      id: bookingId,
      event_id: input.event_id,
      seat_ids: input.seat_ids,
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      promo_code: input.promo_code?.trim().toUpperCase() ?? null,
      status: 'pending',
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    };
  } catch (err) {
    await conn.rollback();
    bookingsFailedTotal.inc({ event_id: String(input.event_id) });
    throw err;
  } finally {
    conn.release();
    if (lockKeys.length > 0) {
      redis.del(...lockKeys).catch(() => { /* best-effort cleanup */ });
    }
  }
}
