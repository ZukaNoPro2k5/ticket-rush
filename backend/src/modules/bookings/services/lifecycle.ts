import pool from '../../../config/database';
import { AppError } from '../../../shared/AppError';
<<<<<<< Updated upstream
=======
import { bookingsConfirmedTotal } from '../../../config/metrics';
import { generateTicketsForBooking } from '../../tickets/service';
>>>>>>> Stashed changes
import type { BookingRow, BookingSeatRow } from './types';
import { updateSeatsStatus } from './helpers';

export async function confirmBooking(bookingId: number, userId: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<BookingRow[]>(
      'SELECT id, user_id, status, expires_at FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId],
    );
    if (rows.length === 0) {
      throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
    }
    const booking = rows[0];

    if (booking.user_id !== userId) {
      throw AppError.forbidden('Bạn không có quyền xác nhận đơn này');
    }
    if (booking.status === 'confirmed') {
      throw AppError.conflict('Đơn đã được thanh toán', 'BOOKING_ALREADY_CONFIRMED');
    }
    if (booking.status === 'cancelled') {
      throw AppError.conflict('Đơn đã bị hủy', 'BOOKING_NOT_CANCELLABLE');
    }
    if (new Date(booking.expires_at) < new Date()) {
      throw AppError.badRequest('Đơn đã hết hạn. Vui lòng đặt lại', 'BOOKING_EXPIRED');
    }

    await conn.execute(
      'UPDATE bookings SET status = ?, confirmed_at = NOW() WHERE id = ?',
      ['confirmed', bookingId],
    );

    const [seatRows] = await conn.execute<BookingSeatRow[]>(
      'SELECT seat_id FROM booking_seats WHERE booking_id = ?',
      [bookingId],
    );
    const seatIds = seatRows.map((r) => r.seat_id);
    if (seatIds.length === 0) {
      throw AppError.badRequest('Don hang khong co ghe', 'BOOKING_EMPTY');
    }

    const placeholders = seatIds.map(() => '?').join(', ');
    const [lockedRows] = await conn.execute<BookingSeatRow[]>(
      `SELECT id AS seat_id FROM seats
       WHERE id IN (${placeholders}) AND status = 'locked' AND locked_by = ?
       FOR UPDATE`,
      [...seatIds, userId],
    );
    if (lockedRows.length !== seatIds.length) {
      throw AppError.conflict('Ghe trong don khong con duoc giu', 'SEATS_UNAVAILABLE');
    }

    await updateSeatsStatus(conn, seatIds, 'sold');
    const tickets = await generateTicketsForBooking(conn, bookingId);

    await conn.commit();
<<<<<<< Updated upstream
    return { bookingId, seatIds };
=======
    bookingsConfirmedTotal.inc();
    return { bookingId, seatIds, tickets };
>>>>>>> Stashed changes
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function cancelBooking(bookingId: number, userId: number, isAdmin = false) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<BookingRow[]>(
      'SELECT id, user_id, status, promo_code_id FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId],
    );
    if (rows.length === 0) {
      throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
    }
    const booking = rows[0];

    if (!isAdmin && booking.user_id !== userId) {
      throw AppError.forbidden('Bạn không có quyền hủy đơn này');
    }
    if (booking.status !== 'pending') {
      throw AppError.conflict('Chỉ có thể hủy đơn đang chờ thanh toán', 'BOOKING_NOT_CANCELLABLE');
    }

    await conn.execute('UPDATE bookings SET status = ? WHERE id = ?', ['cancelled', bookingId]);

    const [seatRows] = await conn.execute<BookingSeatRow[]>(
      'SELECT seat_id FROM booking_seats WHERE booking_id = ?',
      [bookingId],
    );
    const seatIds = seatRows.map((r) => r.seat_id);
    let releasedSeatIds: number[] = [];
    if (seatIds.length > 0) {
      const placeholders = seatIds.map(() => '?').join(', ');
      const [lockedRows] = await conn.execute<BookingSeatRow[]>(
        `SELECT id AS seat_id FROM seats
         WHERE id IN (${placeholders}) AND status = 'locked' AND locked_by = ?`,
        [...seatIds, booking.user_id],
      );
      releasedSeatIds = lockedRows.map((r) => r.seat_id);

      if (releasedSeatIds.length > 0) {
        const releasePlaceholders = releasedSeatIds.map(() => '?').join(', ');
        await conn.execute(
          `UPDATE seats SET status = 'available', locked_by = NULL, locked_at = NULL
           WHERE id IN (${releasePlaceholders}) AND locked_by = ?`,
          [...releasedSeatIds, booking.user_id],
        );
      }
    }

    if (booking.promo_code_id) {
      await conn.execute(
        'UPDATE promo_codes SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?',
        [booking.promo_code_id],
      );
    }

    await conn.commit();
    return { bookingId, seatIds: releasedSeatIds };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
