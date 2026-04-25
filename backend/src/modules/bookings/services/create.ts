import { ResultSetHeader } from 'mysql2';
import pool from '../../../config/database';
import type { CreateBookingInput } from '../validation';
import { applyPromoCode, lockAndValidateSeats, updateSeatsStatus } from './helpers';

export async function createBooking(userId: number, input: CreateBookingInput) {
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
    throw err;
  } finally {
    conn.release();
  }
}
