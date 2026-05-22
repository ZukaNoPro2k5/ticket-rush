import prisma from '../../../config/prisma';
import { AppError } from '../../../shared/AppError';

export async function getBooking(bookingId: number, userId?: number) {
  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
    include: {
      events: { select: { id: true, title: true, venue: true, event_date: true } },
      users: { select: { email: true, full_name: true } },
      booking_seats: {
        include: { seats: { include: { seat_zones: { select: { name: true } } } } },
      },
      promo_codes: { select: { code: true } },
      payments: { select: { payment_method: true, status: true, paid_at: true } },
    },
  });
  if (!booking) throw AppError.notFound('Không tìm thấy đơn đặt vé', 'BOOKING_NOT_FOUND');
  if (userId && booking.user_id !== userId) throw AppError.forbidden('Bạn không có quyền xem đơn này');

  const seats = booking.booking_seats.map((item) => ({
    id: item.seat_id,
    zone_name: item.seats.seat_zones.name,
    row_label: item.seats.row_label,
    col_number: item.seats.col_number,
    price: Number(item.price),
  }));
  return {
    id: booking.id,
    user_id: booking.user_id,
    user: { email: booking.users.email, full_name: booking.users.full_name },
    event: booking.events,
    seats,
    subtotal: seats.reduce((sum, seat) => sum + seat.price, 0),
    discount_amount: Number(booking.discount_amount),
    total_amount: Number(booking.total_amount),
    promo_code: booking.promo_codes?.code ?? null,
    status: booking.status,
    created_at: booking.created_at,
    expires_at: booking.expires_at,
    confirmed_at: booking.confirmed_at,
    payment: booking.payments
      ? { method: booking.payments.payment_method, status: booking.payments.status, paid_at: booking.payments.paid_at }
      : null,
  };
}

export async function getPendingBookingForEvent(userId: number, eventId: number) {
  const booking = await prisma.bookings.findFirst({
    where: { user_id: userId, event_id: eventId, status: 'pending', expires_at: { gt: new Date() } },
    orderBy: { created_at: 'desc' },
    select: { id: true },
  });
  return booking ? getBooking(booking.id, userId) : null;
}

export async function listMyBookings(userId: number, status?: string, page = 1, limit = 10) {
  const where = { user_id: userId, ...(status ? { status: status as 'pending' | 'confirmed' | 'cancelled' } : {}) };
  const [rows, total] = await prisma.$transaction([
    prisma.bookings.findMany({
      where,
      include: {
        events: { select: { id: true, title: true, event_date: true, poster_url: true } },
        _count: { select: { booking_seats: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bookings.count({ where }),
  ]);
  return {
    items: rows.map((row) => ({
      id: row.id,
      event: row.events,
      total_amount: Number(row.total_amount),
      status: row.status,
      seat_count: row._count.booking_seats,
      confirmed_at: row.confirmed_at,
    })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}
