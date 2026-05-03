import { RowDataPacket } from 'mysql2';
import pool from '../../../config/database';
import { AppError } from '../../../shared/AppError';
import type { BookingRow } from './types';

export async function getBooking(bookingId: number, userId?: number) {
  const [rows] = await pool.execute<BookingRow[]>(
    `SELECT id, user_id, event_id, promo_code_id, discount_amount, total_amount,
            status, expires_at, confirmed_at, created_at
     FROM bookings WHERE id = ?`,
    [bookingId],
  );
  if (rows.length === 0) {
    throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
  }
  const booking = rows[0];

  if (userId && booking.user_id !== userId) {
    throw AppError.forbidden('Bạn không có quyền xem đơn này');
  }

  const [eventRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, title, venue, event_date FROM events WHERE id = ?',
    [booking.event_id],
  );

  const [seatRows] = await pool.execute<RowDataPacket[]>(
    `SELECT bs.seat_id AS id, sz.name AS zone_name, s.row_label, s.col_number, bs.price
     FROM booking_seats bs
     JOIN seats s ON s.id = bs.seat_id
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE bs.booking_id = ?`,
    [bookingId],
  );

  let promoCode: string | null = null;
  if (booking.promo_code_id) {
    const [promoRows] = await pool.execute<RowDataPacket[]>(
      'SELECT code FROM promo_codes WHERE id = ?',
      [booking.promo_code_id],
    );
    if (promoRows.length > 0) promoCode = promoRows[0].code;
  }

  const subtotal = seatRows.reduce((sum, s) => sum + Number(s.price), 0);

  return {
    id: booking.id,
    user_id: booking.user_id,
    event: eventRows[0],
    seats: seatRows,
    subtotal,
    discount_amount: Number(booking.discount_amount),
    total_amount: Number(booking.total_amount),
    promo_code: promoCode,
    status: booking.status,
    expires_at: booking.expires_at,
    confirmed_at: booking.confirmed_at,
  };
}

export async function listMyBookings(userId: number, status?: string, page = 1, limit = 10) {
  const conditions = ['b.user_id = ?'];
  const params: (string | number)[] = [userId];

  if (status) {
    conditions.push('b.status = ?');
    params.push(status);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM bookings b ${where}`,
    params,
  );
  const total = countRows[0].total as number;

  const offset = (page - 1) * limit;
  // Use pool.query (not execute) for LIMIT/OFFSET binding compatibility
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT b.id, b.total_amount, b.status, b.confirmed_at,
            e.id AS event_id, e.title AS event_title, e.event_date, e.poster_url,
            (SELECT COUNT(*) FROM booking_seats bs WHERE bs.booking_id = b.id) AS seat_count
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     ${where}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)],
  );

  const items = rows.map((r) => ({
    id: r.id,
    event: { id: r.event_id, title: r.event_title, event_date: r.event_date, poster_url: r.poster_url },
    total_amount: Number(r.total_amount),
    status: r.status,
    seat_count: r.seat_count,
    confirmed_at: r.confirmed_at,
  }));

  return {
    items,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}
