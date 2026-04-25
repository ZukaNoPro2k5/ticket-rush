import pool from '../../../config/database';
import { AppError } from '../../../shared/AppError';
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

    await updateSeatsStatus(conn, seatIds, 'sold');

    await conn.commit();
    return { bookingId, seatIds };
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
    await updateSeatsStatus(conn, seatIds, 'available');

    if (booking.promo_code_id) {
      await conn.execute(
        'UPDATE promo_codes SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?',
        [booking.promo_code_id],
      );
    }

    await conn.commit();
    return { bookingId, seatIds };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
