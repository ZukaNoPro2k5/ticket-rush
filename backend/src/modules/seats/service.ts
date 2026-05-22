import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../shared/AppError';
import { getBookingRules } from '../../config/runtimeSettings';

function normalizeSeat(row: {
  id: number;
  zone_id: number;
  row_label: string;
  col_number: number;
  status: 'available' | 'locked' | 'sold';
  seat_zones: { name: string; color: string; price: Prisma.Decimal };
}) {
  return {
    id: row.id,
    zone_id: row.zone_id,
    zone_name: row.seat_zones.name,
    zone_color: row.seat_zones.color,
    zone_price: row.seat_zones.price.toNumber(),
    row_label: row.row_label,
    col_number: row.col_number,
    status: row.status,
  };
}

const seatInclude = { seat_zones: { select: { name: true, color: true, price: true } } } as const;

export async function listByEvent(eventId: number) {
  const rows = await prisma.seats.findMany({
    where: { seat_zones: { event_id: eventId } },
    include: seatInclude,
    orderBy: [{ zone_id: 'asc' }, { row_label: 'asc' }, { col_number: 'asc' }],
  });
  return rows.map(normalizeSeat);
}

export async function listByZone(eventId: number, zoneId: number) {
  const rows = await prisma.seats.findMany({
    where: { zone_id: zoneId, seat_zones: { event_id: eventId } },
    include: seatInclude,
    orderBy: [{ row_label: 'asc' }, { col_number: 'asc' }],
  });
  return rows.map(normalizeSeat);
}

/**
 * Row locking is one of the few legitimate raw SQL cases left: Prisma does not expose
 * SELECT ... FOR UPDATE in its model API. It still runs inside Prisma's transaction
 * client so the application has one database abstraction boundary.
 */
export async function lockSeats(seatIds: number[], userId: number) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: number; status: 'available' | 'locked' | 'sold' }[]>`
      SELECT id, status FROM seats WHERE id IN (${Prisma.join(seatIds)}) FOR UPDATE
    `;
    if (rows.length !== seatIds.length) throw AppError.notFound('Một số ghế không tồn tại');
    const unavailable = rows.filter((row) => row.status !== 'available');
    if (unavailable.length > 0) {
      throw AppError.conflict(`${unavailable.length} ghế đã bị người khác giữ hoặc đã bán`, 'SEATS_UNAVAILABLE');
    }
    await tx.seats.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'locked', locked_by: userId, locked_at: new Date() },
    });
    return seatIds;
  });
}

export async function releaseSeats(seatIds: number[]) {
  if (seatIds.length === 0) return;
  await prisma.seats.updateMany({
    where: { id: { in: seatIds } },
    data: { status: 'available', locked_by: null, locked_at: null },
  });
}

export async function markSold(seatIds: number[]) {
  if (seatIds.length === 0) return;
  await prisma.seats.updateMany({
    where: { id: { in: seatIds } },
    data: { status: 'sold', locked_by: null, locked_at: null },
  });
}

export async function releaseExpiredSeats() {
  const { ticketHoldMinutes } = await getBookingRules();
  const cutoff = new Date(Date.now() - ticketHoldMinutes * 60 * 1000);
  const rows = await prisma.seats.findMany({
    where: {
      status: 'locked',
      locked_at: { lt: cutoff },
      booking_seats: { none: { bookings: { status: 'pending' } } },
    },
    select: { id: true },
  });
  const seatIds = rows.map((row) => row.id);
  await releaseSeats(seatIds);
  return seatIds;
}
