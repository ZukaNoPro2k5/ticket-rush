import type { Prisma } from '@prisma/client';
import prisma from '../../../config/prisma';

function seatStats(event: {
  seat_zones: Array<{ price: { toNumber(): number }; seats: Array<{ status: 'available' | 'locked' | 'sold' }> }>;
  bookings: Array<{ total_amount: { toNumber(): number } }>;
}) {
  const seats = event.seat_zones.flatMap((zone) => zone.seats);
  const prices = event.seat_zones.map((zone) => zone.price.toNumber());
  return {
    min_price: prices.length ? Math.min(...prices) : null,
    max_price: prices.length ? Math.max(...prices) : null,
    total_seats: seats.length,
    available_seats: seats.filter((seat) => seat.status === 'available').length,
    sold_seats: seats.filter((seat) => seat.status === 'sold').length,
    revenue: event.bookings.reduce((sum, booking) => sum + booking.total_amount.toNumber(), 0),
  };
}

export async function listAdminEvents(params: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status, category, search, page = 1, limit: pageSize = 20 } = params;
  const where: Prisma.eventsWhereInput = {
    ...(status && status !== 'all' ? { status: status as Prisma.Enumevents_statusFilter['equals'] } : {}),
    ...(category && category !== 'all' ? { category: category as Prisma.Enumevents_categoryFilter['equals'] } : {}),
    ...(search?.trim() ? {
      OR: [{ title: { contains: search.trim() } }, { venue: { contains: search.trim() } }],
    } : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.events.findMany({
      where,
      include: {
        seat_zones: { include: { seats: { select: { status: true } } } },
        bookings: { where: { status: 'confirmed' }, select: { total_amount: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.events.count({ where }),
  ]);
  return {
    events: rows.map((event) => ({ ...event, ...seatStats(event) })),
    pagination: { page, limit: pageSize, total, total_pages: Math.ceil(total / pageSize) },
  };
}

export async function getRecentBookings(limit = 8) {
  const rows = await prisma.bookings.findMany({
    where: { status: 'confirmed' },
    include: {
      users: { select: { full_name: true } },
      events: { select: { title: true } },
      _count: { select: { tickets: true } },
    },
    orderBy: { confirmed_at: 'desc' },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    user_name: row.users.full_name,
    event_title: row.events.title,
    total_amount: row.total_amount.toNumber(),
    confirmed_at: row.confirmed_at,
    ticket_count: row._count.tickets,
  }));
}

export async function listUsers(page = 1, limit = 20, search?: string) {
  const where: Prisma.usersWhereInput = search
    ? { OR: [{ full_name: { contains: search } }, { email: { contains: search } }] }
    : {};
  const [users, total] = await prisma.$transaction([
    prisma.users.findMany({
      where,
      select: { id: true, email: true, full_name: true, role: true, created_at: true },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.users.count({ where }),
  ]);
  return { users, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
}

export async function listAdminBookings(page = 1, limit = 20, status?: string, search?: string) {
  const where: Prisma.bookingsWhereInput = {
    ...(status && status !== 'all' ? { status: status as Prisma.Enumbookings_statusFilter['equals'] } : {}),
    ...(search ? {
      OR: [
        { users: { full_name: { contains: search } } },
        { users: { email: { contains: search } } },
        { events: { title: { contains: search } } },
      ],
    } : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.bookings.findMany({
      where,
      include: {
        users: { select: { full_name: true, email: true } },
        events: { select: { title: true, event_date: true } },
        _count: { select: { tickets: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bookings.count({ where }),
  ]);
  return {
    bookings: rows.map((row) => ({
      id: row.id,
      status: row.status,
      total_amount: row.total_amount.toNumber(),
      created_at: row.created_at,
      confirmed_at: row.confirmed_at,
      user_name: row.users.full_name,
      user_email: row.users.email,
      event_title: row.events.title,
      event_date: row.events.event_date,
      ticket_count: row._count.tickets,
    })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}
