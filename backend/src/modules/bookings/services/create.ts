import { ResultSetHeader } from 'mysql2';
import pool from '../../../config/database';
import redis from '../../../config/redis';
import { AppError } from '../../../shared/AppError';
import {
  bookingsCreatedTotal,
  bookingsFailedTotal,
  seatLockContentionTotal,
} from '../../../config/metrics';
import type { CreateBookingInput } from '../validation';
import { applyPromoCode, lockAndValidateSeats, updateSeatsStatus } from './helpers';

// Distributed lock TTL (seconds). Short window — just guards the DB transaction
// against thundering-herd contention. After commit the DB seat row (status='locked')
// becomes the source of truth for the 10-minute hold.
const SEAT_LOCK_TTL_SEC = 15;

// Atomic multi-key lock via Lua. Either ALL seat keys are SET (return 1) or
// NONE are touched and we get the index (1-based) of the first conflicting seat.
// Runs single-threaded inside Redis → no race regardless of how many concurrent
// bookings hit the same seats. Replaces N round-trip SET-NX with 1 EVAL.
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
      'Một hoặc nhiều ghế đang được người khác đặt, vui lòng thử lại',
      409,
    );
  }
  return keys;
}

export async function createBooking(userId: number, input: CreateBookingInput) {
  // Fast-fail Redis lock BEFORE opening DB transaction (avoids holding row locks
  // while waiting on contended seats). The DB FOR UPDATE inside still gives us
  // strong consistency.
  const lockKeys = await acquireSeatLocks(input.event_id, input.seat_ids);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const seatRows = await lockAndValidateSeats(conn, input.seat_ids, input.event_id);
    const subtotal = seatRows.reduce((sum, s) => sum + Number(s.price), 0);

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

    // booking_seats (snapshot giá)
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

    bookingsCreatedTotal.inc({ event_id: String(input.event_id) });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    return {
      id: bookingId,
      event_id: input.event_id,
      seat_ids: input.seat_ids,
      subtotal,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      promo_code: input.promo_code ?? null,
      status: 'pending',
      expires_at: expiresAt,
    };
  } catch (err) {
    await conn.rollback();
    const reason = err instanceof AppError ? err.code : 'UNKNOWN';
    bookingsFailedTotal.inc({ reason });
    throw err;
  } finally {
    conn.release();
    // Always release Redis locks — DB state is now source of truth
    if (lockKeys.length > 0) {
      redis.del(...lockKeys).catch(() => { /* best-effort cleanup */ });
    }
  }
}
