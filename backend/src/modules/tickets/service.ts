import { randomUUID } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import QRCode from 'qrcode';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';

interface TicketRow extends RowDataPacket {
  id: number;
  booking_id: number;
  seat_id: number;
  qr_code: string;
  status: 'active' | 'used' | 'cancelled';
  checked_in_at: string | null;
  created_at: string;
}

interface ScannerPayload {
  ticket_id?: number;
  ticketId?: number;
  booking_id?: number;
  bookingId?: number;
  seat_id?: number;
  seatId?: number;
  token?: string;
}

function buildQrPayload(ticketId: number, bookingId: number, seatId: number, token: string) {
  return JSON.stringify({
    ticket_id: ticketId,
    booking_id: bookingId,
    seat_id: seatId,
    token,
  });
}

async function qrDataUrlForTicket(ticket: {
  id: number;
  booking_id: number;
  seat_id: number;
  qr_code: string;
}) {
  if (ticket.qr_code.startsWith('data:image/')) {
    return ticket.qr_code;
  }

  return QRCode.toDataURL(
    buildQrPayload(ticket.id, ticket.booking_id, ticket.seat_id, ticket.qr_code),
    { width: 300, margin: 2 },
  );
}

function normalizeScannerPayload(input: unknown): ScannerPayload {
  const body = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const rawPayload =
    typeof input === 'string' ? input
      : typeof body.qr_payload === 'string' ? body.qr_payload
        : typeof body.qr_code === 'string' ? body.qr_code
          : typeof body.payload === 'string' ? body.payload
            : typeof body.token === 'string' && body.token.trim().startsWith('{') ? body.token
              : null;

  if (rawPayload) {
    try {
      const parsed = JSON.parse(rawPayload) as ScannerPayload;
      return parsed;
    } catch {
      return { token: rawPayload };
    }
  }

  return {
    ticket_id: typeof body.ticket_id === 'number' ? body.ticket_id : undefined,
    ticketId: typeof body.ticketId === 'number' ? body.ticketId : undefined,
    booking_id: typeof body.booking_id === 'number' ? body.booking_id : undefined,
    bookingId: typeof body.bookingId === 'number' ? body.bookingId : undefined,
    seat_id: typeof body.seat_id === 'number' ? body.seat_id : undefined,
    seatId: typeof body.seatId === 'number' ? body.seatId : undefined,
    token: typeof body.token === 'string' ? body.token : undefined,
  };
}

/**
 * Create one ticket per booked seat. The database stores a short QR token in
 * tickets.qr_code so it fits the current schema; API responses render it as a
 * QR data URL for the frontend.
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
    const token = randomUUID();
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO tickets (booking_id, seat_id, qr_code) VALUES (?, ?, ?)',
      [bookingId, seat.seat_id, token],
    );

    const ticketId = result.insertId;
    const qr_code = await QRCode.toDataURL(
      buildQrPayload(ticketId, bookingId, Number(seat.seat_id), token),
      { width: 300, margin: 2 },
    );

    tickets.push({
      id: ticketId,
      seat: `${seat.zone_name} - ${seat.row_label}${seat.col_number}`,
      qr_code,
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
  const total = Number(countRows[0]?.total ?? 0);

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
    `SELECT t.id, t.booking_id, t.seat_id, t.qr_code, t.status, t.checked_in_at, t.created_at,
            e.id AS event_id, e.title AS event_title, e.venue, e.event_date,
            sz.name AS zone_name, s.row_label, s.col_number, bs.price,
            u.full_name AS holder_name, u.email AS holder_email,
            b.user_id AS owner_id
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
    throw AppError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
  }

  const r = rows[0];

  if (userId && r.owner_id !== userId) {
    throw AppError.forbidden('You do not have permission to view this ticket');
  }

  return {
    id: r.id,
    booking_id: r.booking_id,
    event: { id: r.event_id, title: r.event_title, venue: r.venue, event_date: r.event_date },
    seat: {
      zone_name: r.zone_name,
      row_label: r.row_label,
      col_number: r.col_number,
      price: Number(r.price),
    },
    holder: { full_name: r.holder_name, email: r.holder_email },
    qr_code: await qrDataUrlForTicket({
      id: r.id,
      booking_id: r.booking_id,
      seat_id: r.seat_id,
      qr_code: r.qr_code,
    }),
    status: r.status,
    checked_in_at: r.checked_in_at,
  };
}

export async function checkIn(ticketId: number) {
  const [rows] = await pool.execute<TicketRow[]>(
    `SELECT t.id, t.status
     FROM tickets t
     JOIN bookings b ON b.id = t.booking_id
     JOIN events e ON e.id = b.event_id
     WHERE t.id = ? AND DATE(e.event_date) >= CURDATE()`,
    [ticketId],
  );
  if (rows.length === 0) {
    throw AppError.notFound('Ticket not found or event already passed', 'TICKET_NOT_FOUND');
  }
  if (rows[0].status === 'used') {
    throw AppError.badRequest('Ticket already checked in', 'TICKET_ALREADY_USED');
  }
  if (rows[0].status === 'cancelled') {
    throw AppError.badRequest('Ticket is cancelled', 'TICKET_CANCELLED');
  }

  await pool.execute<ResultSetHeader>(
    "UPDATE tickets SET status = 'used', checked_in_at = NOW() WHERE id = ?",
    [ticketId],
  );

  return getTicket(ticketId);
}

export async function checkInByQr(input: unknown) {
  const payload = normalizeScannerPayload(input);
  const ticketId = Number(payload.ticket_id ?? payload.ticketId);
  const bookingId = Number(payload.booking_id ?? payload.bookingId);
  const seatId = Number(payload.seat_id ?? payload.seatId);
  const token = payload.token?.trim();

  let rows: TicketRow[] = [];

  if (Number.isInteger(ticketId) && ticketId > 0) {
    const [found] = await pool.execute<TicketRow[]>(
      'SELECT id, booking_id, seat_id, qr_code, status, checked_in_at, created_at FROM tickets WHERE id = ?',
      [ticketId],
    );
    rows = found;
  } else if (token) {
    const [found] = await pool.execute<TicketRow[]>(
      'SELECT id, booking_id, seat_id, qr_code, status, checked_in_at, created_at FROM tickets WHERE qr_code = ?',
      [token],
    );
    rows = found;
  } else if (Number.isInteger(bookingId) && Number.isInteger(seatId)) {
    const [found] = await pool.execute<TicketRow[]>(
      `SELECT id, booking_id, seat_id, qr_code, status, checked_in_at, created_at
       FROM tickets
       WHERE booking_id = ? AND seat_id = ?`,
      [bookingId, seatId],
    );
    rows = found;
  }

  if (rows.length === 0) {
    throw AppError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
  }

  const ticket = rows[0];
  const tokenMismatch = token && !ticket.qr_code.startsWith('data:image/') && ticket.qr_code !== token;
  const bookingMismatch = Number.isInteger(bookingId) && bookingId > 0 && ticket.booking_id !== bookingId;
  const seatMismatch = Number.isInteger(seatId) && seatId > 0 && ticket.seat_id !== seatId;

  if (tokenMismatch || bookingMismatch || seatMismatch) {
    throw AppError.badRequest('Invalid QR payload', 'INVALID_QR');
  }

  return checkIn(ticket.id);
}
