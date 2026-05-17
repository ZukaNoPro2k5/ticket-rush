import pool from '../../../config/database';
import { AppError } from '../../../shared/AppError';
import { bookingsConfirmedTotal } from '../../../config/metrics';
import { getBookingRules } from '../../../config/runtimeSettings';
import type { BookingRow, BookingSeatRow } from './types';
import { applyPromoCode, lockAndValidateSeats, updateSeatsStatus } from './helpers';

export async function replaceBookingSeats(bookingId: number, userId: number, nextSeatIds: number[]) {
  const rules = await getBookingRules();
  if (nextSeatIds.length > rules.maxTicketsPerBooking) {
    throw AppError.badRequest(
      `Tối đa ${rules.maxTicketsPerBooking} vé cho mỗi giao dịch`,
      'MAX_TICKETS_PER_BOOKING',
    );
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<BookingRow[]>(
      `SELECT id, user_id, event_id, status, expires_at, promo_code_id
       FROM bookings
       WHERE id = ?
       FOR UPDATE`,
      [bookingId],
    );
    if (rows.length === 0) {
      throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
    }
    const booking = rows[0];

    if (booking.user_id !== userId) {
      throw AppError.forbidden('Bạn không có quyền chỉnh ghế của đơn này');
    }
    if (booking.status !== 'pending') {
      throw AppError.conflict('Chỉ có thể chỉnh ghế của đơn đang chờ thanh toán', 'BOOKING_NOT_EDITABLE');
    }
    if (new Date(booking.expires_at) < new Date()) {
      throw AppError.badRequest('Đơn đã hết hạn. Vui lòng đặt lại', 'BOOKING_EXPIRED');
    }

    const [currentRows] = await conn.execute<BookingSeatRow[]>(
      'SELECT seat_id FROM booking_seats WHERE booking_id = ?',
      [bookingId],
    );
    const currentSeatIds = currentRows.map((row) => row.seat_id);
    const current = new Set(currentSeatIds);
    const next = new Set(nextSeatIds);
    const addedSeatIds = nextSeatIds.filter((seatId) => !current.has(seatId));
    const removedSeatIds = currentSeatIds.filter((seatId) => !next.has(seatId));

    if (addedSeatIds.length > 0) {
      const addedSeatRows = await lockAndValidateSeats(conn, addedSeatIds, booking.event_id);
      const placeholders = addedSeatRows.map(() => '(?, ?, ?)').join(', ');
      const values = addedSeatRows.flatMap((seat) => [bookingId, seat.id, seat.price]);
      await conn.execute(
        `INSERT INTO booking_seats (booking_id, seat_id, price) VALUES ${placeholders}`,
        values,
      );
      await updateSeatsStatus(conn, addedSeatIds, 'locked', userId);
    }

    if (removedSeatIds.length > 0) {
      const placeholders = removedSeatIds.map(() => '?').join(', ');
      await conn.execute(
        `DELETE FROM booking_seats
         WHERE booking_id = ? AND seat_id IN (${placeholders})`,
        [bookingId, ...removedSeatIds],
      );
      await updateSeatsStatus(conn, removedSeatIds, 'available');
    }

    if (booking.promo_code_id) {
      await conn.execute(
        'UPDATE promo_codes SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?',
        [booking.promo_code_id],
      );
    }

    const [[subtotalRow]] = await conn.execute<(import('mysql2').RowDataPacket & { subtotal: number })[]>(
      'SELECT COALESCE(SUM(price), 0) AS subtotal FROM booking_seats WHERE booking_id = ?',
      [bookingId],
    );
    const subtotal = Number(subtotalRow?.subtotal ?? 0);

    await conn.execute(
      `UPDATE bookings
       SET promo_code_id = NULL, discount_amount = 0, total_amount = ?
       WHERE id = ?`,
      [subtotal, bookingId],
    );

    await conn.commit();
    return {
      bookingId,
      eventId: booking.event_id,
      seatIds: nextSeatIds,
      addedSeatIds,
      removedSeatIds,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function applyBookingPromo(bookingId: number, userId: number, code: string) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<BookingRow[]>(
      `SELECT id, user_id, event_id, status, expires_at, promo_code_id
       FROM bookings
       WHERE id = ?
       FOR UPDATE`,
      [bookingId],
    );
    if (rows.length === 0) {
      throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
    }
    const booking = rows[0];

    if (booking.user_id !== userId) {
      throw AppError.forbidden('Bạn không có quyền áp mã cho đơn này');
    }
    if (booking.status !== 'pending') {
      throw AppError.conflict('Chỉ có thể áp mã cho đơn đang chờ thanh toán', 'BOOKING_NOT_EDITABLE');
    }
    if (new Date(booking.expires_at) < new Date()) {
      throw AppError.badRequest('Đơn đã hết hạn. Vui lòng đặt lại', 'BOOKING_EXPIRED');
    }

    const [[subtotalRow]] = await conn.execute<(import('mysql2').RowDataPacket & { subtotal: number })[]>(
      'SELECT COALESCE(SUM(price), 0) AS subtotal FROM booking_seats WHERE booking_id = ?',
      [bookingId],
    );
    const subtotal = Number(subtotalRow?.subtotal ?? 0);

    if (booking.promo_code_id) {
      await conn.execute(
        'UPDATE promo_codes SET used_count = GREATEST(used_count - 1, 0) WHERE id = ?',
        [booking.promo_code_id],
      );
    }

    const { promoCodeId, discountAmount } = await applyPromoCode(conn, code, booking.event_id, subtotal);
    const totalAmount = subtotal - discountAmount;

    await conn.execute(
      `UPDATE bookings
       SET promo_code_id = ?, discount_amount = ?, total_amount = ?
       WHERE id = ?`,
      [promoCodeId, discountAmount, totalAmount, bookingId],
    );

    await conn.commit();
    return { bookingId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function confirmBooking(bookingId: number, userId: number, paymentMethod: string) {
  const conn = await pool.getConnection();
  let didConfirm = false;
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<BookingRow[]>(
      'SELECT id, user_id, status, expires_at, total_amount FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId],
    );
    if (rows.length === 0) {
      throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
    }
    const booking = rows[0];

    if (booking.user_id !== userId) {
      throw AppError.forbidden('Bạn không có quyền xác nhận đơn này');
    }
    if (booking.status === 'cancelled') {
      throw AppError.conflict('Đơn đã bị hủy', 'BOOKING_NOT_CANCELLABLE');
    }
    if (booking.status !== 'confirmed' && new Date(booking.expires_at) < new Date()) {
      throw AppError.badRequest('Đơn đã hết hạn. Vui lòng đặt lại', 'BOOKING_EXPIRED');
    }

    const [paymentMethodRows] = await conn.execute<
      (import('mysql2').RowDataPacket & { id: string })[]
    >(
      'SELECT id FROM payment_gateways WHERE id = ? AND enabled = TRUE LIMIT 1',
      [paymentMethod],
    );
    if (paymentMethodRows.length === 0) {
      throw AppError.badRequest('Phương thức thanh toán không khả dụng', 'PAYMENT_METHOD_UNAVAILABLE');
    }

    const [seatRows] = await conn.execute<BookingSeatRow[]>(
      'SELECT seat_id FROM booking_seats WHERE booking_id = ?',
      [bookingId],
    );
    const seatIds = seatRows.map((r) => r.seat_id);

    if (booking.status !== 'confirmed') {
      await conn.execute(
        `INSERT INTO payments (
           booking_id, payment_method, amount, status, provider_reference, paid_at
         ) VALUES (?, ?, ?, 'succeeded', ?, NOW())
         ON DUPLICATE KEY UPDATE
           payment_method = VALUES(payment_method),
           amount = VALUES(amount),
           status = 'succeeded',
           provider_reference = VALUES(provider_reference),
           paid_at = NOW()`,
        [bookingId, paymentMethod, booking.total_amount, `sandbox_${bookingId}_${Date.now()}`],
      );
      await conn.execute(
        'UPDATE bookings SET status = ?, confirmed_at = NOW() WHERE id = ?',
        ['confirmed', bookingId],
      );
      await updateSeatsStatus(conn, seatIds, 'sold');
      didConfirm = true;
    }

    await conn.commit();
    if (didConfirm) bookingsConfirmedTotal.inc();
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
      throw AppError.conflict('Chỉ có thể hủy đơn đang chờ xác nhận', 'BOOKING_NOT_CANCELLABLE');
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
