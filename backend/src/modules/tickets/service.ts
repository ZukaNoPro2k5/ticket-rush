import { RowDataPacket, ResultSetHeader } from 'mysql2';
import QRCode from 'qrcode';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';

interface TicketRow extends RowDataPacket {
  id: number;
  booking_id: number;
  seat_id: number;
  qr_code: string;
  status: string;
  checked_in_at: string | null;
  created_at: string;
}

/**
 * Tạo tickets cho tất cả ghế trong booking (gọi sau khi confirm)
 */
export async function generateTickets(bookingId: number) {
  const [seatRows] = await pool.execute<RowDataPacket[]>(
    `SELECT bs.seat_id, sz.name AS zone_name, s.row_label, s.col_number
     FROM booking_seats bs
     JOIN seats s ON s.id = bs.seat_id
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE bs.booking_id = ?`,
    [bookingId],
  );

  const tickets: { id: number; seat: string; qr_code: string }[] = [];

  for (const seat of seatRows) {
    // QR payload: JSON with ticket info
    const qrPayload = JSON.stringify({
      booking_id: bookingId,
      seat_id: seat.seat_id,
      ts: Date.now(),
    });
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 300, margin: 2 });

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tickets (booking_id, seat_id, qr_code) VALUES (?, ?, ?)',
      [bookingId, seat.seat_id, qrDataUrl],
    );

    tickets.push({
      id: result.insertId,
      seat: `${seat.zone_name} - ${seat.row_label}${seat.col_number}`,
      qr_code: qrDataUrl,
    });
  }

  return tickets;
}

export async function listMyTickets(userId: number, status?: string, page = 1, limit = 10) {
  const conditions = ['b.user_id = ?', 'b.status = ?'];
  const params: (string | number | boolean | null)[] = [userId, 'confirmed'];

  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM tickets t
     JOIN bookings b ON b.id = t.booking_id
     ${where}`,
    params,
  );
  const total = countRows[0].total as number;

  const offset = (page - 1) * limit;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT t.id, t.status, t.checked_in_at, t.created_at,
            e.id AS event_id, e.title AS event_title, e.venue, e.event_date,
            sz.name AS zone_name, s.row_label, s.col_number
     FROM tickets t
     JOIN bookings b ON b.id = t.booking_id
     JOIN events e ON e.id = b.event_id
     JOIN seats s ON s.id = t.seat_id
     JOIN seat_zones sz ON sz.id = s.zone_id
     ${where}
     ORDER BY t.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const items = rows.map((r) => ({
    id: r.id,
    event: { id: r.event_id, title: r.event_title, venue: r.venue, event_date: r.event_date },
    seat: { zone_name: r.zone_name, row_label: r.row_label, col_number: r.col_number },
    status: r.status,
    checked_in_at: r.checked_in_at,
    created_at: r.created_at,
  }));

  return { items, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function getTicket(ticketId: number, userId?: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT t.id, t.booking_id, t.qr_code, t.status, t.checked_in_at, t.created_at,
            e.id AS event_id, e.title AS event_title, e.venue, e.event_date,
            sz.name AS zone_name, s.row_label, s.col_number, bs.price,
            u.full_name AS holder_name, u.email AS holder_email
     FROM tickets t
     JOIN bookings b ON b.id = t.booking_id
     JOIN events e ON e.id = b.event_id
     JOIN seats s ON s.id = t.seat_id
     JOIN seat_zones sz ON sz.id = s.zone_id
     JOIN booking_seats bs ON bs.seat_id = t.seat_id AND bs.booking_id = t.booking_id
     JOIN users u ON u.id = b.user_id
     WHERE t.id = ?`,
    [ticketId],
  );

  if (rows.length === 0) {
    throw AppError.notFound('Vé không tồn tại', 'TICKET_NOT_FOUND');
  }

  const r = rows[0];

  // Nếu không phải admin thì chỉ xem vé của mình
  if (userId) {
    const [ownerRows] = await pool.execute<RowDataPacket[]>(
      'SELECT user_id FROM bookings WHERE id = ?',
      [r.booking_id],
    );
    if (ownerRows[0]?.user_id !== userId) {
      throw AppError.forbidden('Bạn không có quyền xem vé này');
    }
  }

  return {
    id: r.id,
    booking_id: r.booking_id,
    event: { id: r.event_id, title: r.event_title, venue: r.venue, event_date: r.event_date },
    seat: { zone_name: r.zone_name, row_label: r.row_label, col_number: r.col_number, price: r.price },
    holder: { full_name: r.holder_name, email: r.holder_email },
    qr_code: r.qr_code,
    status: r.status,
    checked_in_at: r.checked_in_at,
  };
}

export async function checkIn(ticketId: number) {
  const [rows] = await pool.execute<TicketRow[]>(
    'SELECT id, status FROM tickets WHERE id = ?',
    [ticketId],
  );
  if (rows.length === 0) {
    throw AppError.notFound('Vé không tồn tại', 'TICKET_NOT_FOUND');
  }
  if (rows[0].status === 'used') {
    throw AppError.badRequest('Vé đã được soát', 'TICKET_ALREADY_USED');
  }
  if (rows[0].status === 'cancelled') {
    throw AppError.badRequest('Vé đã bị hủy', 'TICKET_CANCELLED');
  }

  await pool.execute<ResultSetHeader>(
    "UPDATE tickets SET status = 'used', checked_in_at = NOW() WHERE id = ?",
    [ticketId],
  );

  // Trả thông tin soát vé
  return getTicket(ticketId);
}
