import prisma from '../../config/prisma';
import { AppError } from '../../shared/AppError';
import type { CreateSeatZoneInput, UpdateSeatZoneInput } from './validation';
import { invalidateEvent } from '../events/service';

type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
type SeatingMode = 'seated' | 'zoned' | 'admission';

function normalizeZone(zone: {
  id: number;
  event_id: number;
  name: string;
  price: { toNumber(): number };
  color: string;
  total_rows: number;
  total_cols: number;
  seats: Array<{ status: 'available' | 'locked' | 'sold' }>;
}) {
  return {
    id: zone.id,
    event_id: zone.event_id,
    name: zone.name,
    price: zone.price.toNumber(),
    color: zone.color,
    total_rows: zone.total_rows,
    total_cols: zone.total_cols,
    available_seats: zone.seats.filter((seat) => seat.status === 'available').length,
    total_seats: zone.seats.length,
  };
}

async function getZoneById(zoneId: number, eventId?: number) {
  const zone = await prisma.seat_zones.findFirst({
    where: { id: zoneId, ...(eventId ? { event_id: eventId } : {}) },
    include: { seats: { select: { status: true } } },
  });
  return zone ? normalizeZone(zone) : null;
}

function assertValidDimensionsForMode(mode: SeatingMode, totalRows: number, totalCols: number) {
  if (mode === 'seated') {
    if (totalRows < 1 || totalRows > 26) throw AppError.badRequest('Khu ghế ngồi chỉ hỗ trợ 1–26 hàng', 'INVALID_SEAT_MATRIX');
    if (totalCols < 1 || totalCols > 50) throw AppError.badRequest('Khu ghế ngồi chỉ hỗ trợ 1–50 cột', 'INVALID_SEAT_MATRIX');
    return;
  }
  if (totalRows !== 1) throw AppError.badRequest('Khu vực/vào cửa phải dùng đúng 1 hàng logic', 'INVALID_ZONE_CAPACITY');
  if (totalCols < 1 || totalCols > 99999) throw AppError.badRequest('Sức chứa khu vực không hợp lệ', 'INVALID_ZONE_CAPACITY');
}

function buildSeatMatrix(zoneId: number, totalRows: number, totalCols: number) {
  const seats: Array<{ zone_id: number; row_label: string; col_number: number }> = [];
  for (let row = 0; row < totalRows; row += 1) {
    const rowLabel = String.fromCharCode(65 + row);
    for (let col = 1; col <= totalCols; col += 1) seats.push({ zone_id: zoneId, row_label: rowLabel, col_number: col });
  }
  return seats;
}

async function ensureDraftEvent(eventId: number) {
  const event = await prisma.events.findUnique({ where: { id: eventId }, select: { id: true, status: true, seating_mode: true } });
  if (!event) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
  // if (event.status !== 'draft') throw AppError.conflict('Seat zones can only be changed while event is draft', 'EVENT_NOT_EDITABLE');
  return event;
}

async function ensureZoneEditable(zoneId: number, eventId: number) {
  const zone = await prisma.seat_zones.findFirst({
    where: { id: zoneId, event_id: eventId },
    select: { total_rows: true, total_cols: true, events: { select: { status: true, seating_mode: true } } },
  });
  if (!zone) throw AppError.notFound('Seat zone not found', 'SEAT_ZONE_NOT_FOUND');
  // if (zone.events.status !== 'draft') throw AppError.conflict('Seat zones can only be changed while event is draft', 'EVENT_NOT_EDITABLE');
  return { ...zone, status: zone.events.status, seating_mode: zone.events.seating_mode };
}

export async function listSeatZones(eventId: number) {
  await ensureEventExists(eventId);
  const rows = await prisma.seat_zones.findMany({
    where: { event_id: eventId },
    include: { seats: { select: { status: true } } },
    orderBy: { id: 'asc' },
  });
  return rows.map(normalizeZone);
}

async function ensureEventExists(eventId: number) {
  const event = await prisma.events.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
}

export async function createSeatZone(eventId: number, input: CreateSeatZoneInput) {
  const zone = await prisma.$transaction(async (tx) => {
    const events = await tx.$queryRaw<Array<{ id: number; status: EventStatus; seating_mode: SeatingMode }>>`
      SELECT id, status, seating_mode FROM events WHERE id = ${eventId} FOR UPDATE
    `;
    const event = events[0];
    if (!event) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
    // if (event.status !== 'draft') throw AppError.conflict('Seat zones can only be changed while event is draft', 'EVENT_NOT_EDITABLE');
    assertValidDimensionsForMode(event.seating_mode, input.total_rows, input.total_cols);
    const created = await tx.seat_zones.create({ data: { event_id: eventId, ...input } });
    await tx.seats.createMany({ data: buildSeatMatrix(created.id, input.total_rows, input.total_cols) });
    return created.id;
  });
  await invalidateEvent(eventId);
  return getZoneById(zone, eventId);
}

export async function updateSeatZone(eventId: number, zoneId: number, input: UpdateSeatZoneInput) {
  await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{
      status: EventStatus;
      seating_mode: SeatingMode;
      total_rows: number;
      total_cols: number;
    }>>`
      SELECT e.status, e.seating_mode, sz.total_rows, sz.total_cols
      FROM seat_zones sz
      JOIN events e ON e.id = sz.event_id
      WHERE sz.id = ${zoneId} AND sz.event_id = ${eventId}
      FOR UPDATE
    `;
    const current = rows[0];
    if (!current) throw AppError.notFound('Seat zone not found', 'SEAT_ZONE_NOT_FOUND');
    // if (current.status !== 'draft') throw AppError.conflict('Seat zones can only be changed while event is draft', 'EVENT_NOT_EDITABLE');
    const nextRows = input.total_rows ?? current.total_rows;
    const nextCols = input.total_cols ?? current.total_cols;
    assertValidDimensionsForMode(current.seating_mode, nextRows, nextCols);
    await tx.seat_zones.update({ where: { id: zoneId }, data: input });
    if (nextRows !== current.total_rows || nextCols !== current.total_cols) {
      await tx.seats.deleteMany({ where: { zone_id: zoneId } });
      await tx.seats.createMany({ data: buildSeatMatrix(zoneId, nextRows, nextCols) });
    }
  });
  await invalidateEvent(eventId);
  return getZoneById(zoneId, eventId);
}

export async function deleteSeatZone(eventId: number, zoneId: number) {
  await ensureZoneEditable(zoneId, eventId);
  await prisma.seat_zones.deleteMany({ where: { id: zoneId, event_id: eventId } });
  await invalidateEvent(eventId);
}

export async function assertEventCanReceiveZones(eventId: number) {
  await ensureDraftEvent(eventId);
}
