import { randomUUID } from 'crypto';
import QRCode from 'qrcode';
import prisma from '../../config/prisma';
import { AppError } from '../../shared/AppError';

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
  return JSON.stringify({ ticket_id: ticketId, booking_id: bookingId, seat_id: seatId, token });
}

async function qrDataUrlForTicket(ticket: { id: number; booking_id: number; seat_id: number; qr_code: string }) {
  if (ticket.qr_code.startsWith('data:image/')) return ticket.qr_code;
  return QRCode.toDataURL(buildQrPayload(ticket.id, ticket.booking_id, ticket.seat_id, ticket.qr_code), { width: 300, margin: 2 });
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
      return JSON.parse(rawPayload) as ScannerPayload;
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

export async function generateTickets(bookingId: number) {
  const seats = await prisma.booking_seats.findMany({
    where: { booking_id: bookingId },
    include: {
      seats: { include: { seat_zones: { select: { name: true } } } },
    },
  });
  const existing = await prisma.tickets.findMany({ where: { booking_id: bookingId } });
  const existingBySeat = new Map(existing.map((ticket) => [ticket.seat_id, ticket]));
  const tickets: { id: number; seat: string; qr_code: string }[] = [];
  for (const row of seats) {
    let ticket = existingBySeat.get(row.seat_id);
    if (!ticket) {
      ticket = await prisma.tickets.upsert({
        where: { booking_id_seat_id: { booking_id: bookingId, seat_id: row.seat_id } },
        update: {},
        create: { booking_id: bookingId, seat_id: row.seat_id, qr_code: randomUUID() },
      });
    }
    tickets.push({
      id: ticket.id,
      seat: `${row.seats.seat_zones.name} - ${row.seats.row_label}${row.seats.col_number}`,
      qr_code: await qrDataUrlForTicket(ticket),
    });
  }
  return tickets;
}

export async function listMyTickets(userId: number, status?: string, page = 1, limit = 10) {
  const where = {
    bookings: { user_id: userId, status: 'confirmed' as const },
    ...(status ? { status: status as 'active' | 'used' | 'cancelled' } : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.tickets.findMany({
      where,
      include: {
        bookings: { include: { events: { select: { id: true, title: true, venue: true, event_date: true } } } },
        seats: { include: { seat_zones: { select: { name: true } } } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tickets.count({ where }),
  ]);
  return {
    items: rows.map((row) => ({
      id: row.id,
      event: row.bookings.events,
      seat: { zone_name: row.seats.seat_zones.name, row_label: row.seats.row_label, col_number: row.seats.col_number },
      status: row.status,
      checked_in_at: row.checked_in_at,
      created_at: row.created_at,
    })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getTicket(ticketId: number, userId?: number) {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
    include: {
      bookings: {
        include: {
          events: { select: { id: true, title: true, venue: true, event_date: true } },
          users: { select: { full_name: true, email: true } },
        },
      },
      seats: { include: { seat_zones: { select: { name: true } } } },
    },
  });
  if (!ticket) throw AppError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
  if (userId && ticket.bookings.user_id !== userId) throw AppError.forbidden('You do not have permission to view this ticket');
  const bookingSeat = await prisma.booking_seats.findFirst({
    where: { booking_id: ticket.booking_id, seat_id: ticket.seat_id },
    select: { price: true },
  });
  return {
    id: ticket.id,
    booking_id: ticket.booking_id,
    event: ticket.bookings.events,
    seat: {
      zone_name: ticket.seats.seat_zones.name,
      row_label: ticket.seats.row_label,
      col_number: ticket.seats.col_number,
      price: Number(bookingSeat?.price ?? 0),
    },
    holder: ticket.bookings.users,
    qr_code: await qrDataUrlForTicket(ticket),
    status: ticket.status,
    checked_in_at: ticket.checked_in_at,
  };
}

export async function checkIn(ticketId: number) {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
    include: { bookings: { include: { events: { select: { event_date: true } } } } },
  });
  const today = new Date();
  const eventDate = ticket?.bookings.events.event_date;
  const sameDay = eventDate
    && eventDate.getFullYear() === today.getFullYear()
    && eventDate.getMonth() === today.getMonth()
    && eventDate.getDate() === today.getDate();
  if (!ticket || !sameDay) throw AppError.notFound('Ticket not found or event is not today', 'TICKET_NOT_FOUND');
  if (ticket.status === 'used') throw AppError.badRequest('Ticket already checked in', 'TICKET_ALREADY_USED');
  if (ticket.status === 'cancelled') throw AppError.badRequest('Ticket is cancelled', 'TICKET_CANCELLED');
  await prisma.tickets.update({ where: { id: ticketId }, data: { status: 'used', checked_in_at: new Date() } });
  return getTicket(ticketId);
}

export async function checkInByQr(input: unknown) {
  const payload = normalizeScannerPayload(input);
  const ticketId = Number(payload.ticket_id ?? payload.ticketId);
  const bookingId = Number(payload.booking_id ?? payload.bookingId);
  const seatId = Number(payload.seat_id ?? payload.seatId);
  const token = payload.token?.trim();
  const ticket = Number.isInteger(ticketId) && ticketId > 0
    ? await prisma.tickets.findUnique({ where: { id: ticketId } })
    : token
      ? await prisma.tickets.findUnique({ where: { qr_code: token } })
      : Number.isInteger(bookingId) && Number.isInteger(seatId)
        ? await prisma.tickets.findUnique({ where: { booking_id_seat_id: { booking_id: bookingId, seat_id: seatId } } })
        : null;
  if (!ticket) throw AppError.notFound('Ticket not found', 'TICKET_NOT_FOUND');
  const tokenMismatch = token && !ticket.qr_code.startsWith('data:image/') && ticket.qr_code !== token;
  const bookingMismatch = Number.isInteger(bookingId) && bookingId > 0 && ticket.booking_id !== bookingId;
  const seatMismatch = Number.isInteger(seatId) && seatId > 0 && ticket.seat_id !== seatId;
  if (tokenMismatch || bookingMismatch || seatMismatch) throw AppError.badRequest('Invalid QR payload', 'INVALID_QR');
  return checkIn(ticket.id);
}

export async function resolveTicketByQr(bookingId: number, seatId: number) {
  const ticket = await prisma.tickets.findUnique({
    where: { booking_id_seat_id: { booking_id: bookingId, seat_id: seatId } },
    select: { id: true },
  });
  if (!ticket) throw AppError.notFound('Vé không tồn tại', 'TICKET_NOT_FOUND');
  return { ticket_id: ticket.id };
}
