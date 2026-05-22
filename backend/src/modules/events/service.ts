import prisma from '../../config/prisma';
import redis from '../../config/redis';
import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/AppError';
import { clearEventQueue } from '../queue/service';
import type { ListEventsQuery, CreateEventInput, UpdateEventInput, ChangeStatusInput } from './validation';

type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
type SeatingMode = 'seated' | 'zoned' | 'admission';
type EventWithZones = Awaited<ReturnType<typeof getRawEvent>>;

const EVENTS_LIST_TTL = 60;
const EVENT_DETAIL_TTL = 30;
const EVENTS_LIST_PREFIX = 'events:list:';
const EVENT_DETAIL_PREFIX = 'events:detail:';

async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}
async function cacheSet(key: string, value: unknown, ttl: number) {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch {
    // Cache failures must not break event reads.
  }
}
export async function invalidateEvent(id: number) {
  try {
    await redis.del(`${EVENT_DETAIL_PREFIX}${id}`);
    await invalidateEventLists();
  } catch {
    // Cache invalidation is best-effort; the database remains the source of truth.
  }
}
async function invalidateEventLists() {
  try {
    const keys = await redis.keys(`${EVENTS_LIST_PREFIX}*`);
    if (keys.length) await redis.del(...keys);
  } catch {
    // Cache invalidation is best-effort; the database remains the source of truth.
  }
}

function getRawEvent(id: number) {
  return prisma.events.findUnique({
    where: { id },
    include: { seat_zones: { include: { seats: { select: { status: true } } } } },
  });
}

function normalizeEvent(row: NonNullable<EventWithZones>) {
  const prices = row.seat_zones.map((zone) => zone.price.toNumber());
  const seats = row.seat_zones.flatMap((zone) => zone.seats);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    seating_mode: row.seating_mode,
    venue: row.venue,
    event_date: row.event_date,
    poster_url: row.poster_url,
    status: row.status,
    queue_enabled: row.queue_enabled,
    layout_config: row.layout_config,
    created_by: row.created_by,
    created_at: row.created_at,
    min_price: prices.length ? Math.min(...prices) : null,
    max_price: prices.length ? Math.max(...prices) : null,
    available_seats: seats.filter((seat) => seat.status === 'available').length,
    total_seats: seats.length,
  };
}

function normalizeZones(row: NonNullable<EventWithZones>) {
  return row.seat_zones
    .map((zone) => ({
      id: zone.id,
      event_id: zone.event_id,
      name: zone.name,
      price: zone.price.toNumber(),
      color: zone.color,
      total_rows: zone.total_rows,
      total_cols: zone.total_cols,
      available_seats: zone.seats.filter((seat) => seat.status === 'available').length,
      total_seats: zone.seats.length,
    }))
    .sort((a, b) => a.price - b.price || a.id - b.id);
}

function zonesFitMode(mode: SeatingMode, zones: Array<{ total_rows: number; total_cols: number }>) {
  return zones.every((zone) => mode === 'seated'
    ? zone.total_rows >= 1 && zone.total_rows <= 26 && zone.total_cols >= 1 && zone.total_cols <= 50
    : zone.total_rows === 1 && zone.total_cols >= 1 && zone.total_cols <= 99999);
}

function cityMatches(venue: string, city?: ListEventsQuery['city']) {
  if (!city) return true;
  const aliases = {
    'ha-noi': ['hà nội', 'ha noi'],
    'ho-chi-minh': ['hồ chí minh', 'ho chi minh', 'tp.hcm', 'tp. hcm', 'hcm'],
    'da-nang': ['đà nẵng', 'da nang'],
    'hai-phong': ['hải phòng', 'hai phong'],
    hue: ['huế', 'hue'],
  } as const;
  const haystack = venue.toLowerCase();
  const known = Object.values(aliases).flat();
  return city === 'other'
    ? known.every((alias) => !haystack.includes(alias))
    : aliases[city].some((alias) => haystack.includes(alias));
}

function timeMatches(date: Date, range?: ListEventsQuery['time_range']) {
  if (!range) return true;
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
  if (range === 'today') return sameDay;
  if (range === 'weekend') return [0, 6].includes(date.getDay());
  if (range === 'week') return date <= new Date(now.getTime() + 7 * 86_400_000);
  if (range === 'month') return date <= new Date(now.getTime() + 30 * 86_400_000);
  if (range === 'next_month') return date >= nextMonth && date <= nextMonthEnd;
  return date > nextMonthEnd;
}

export async function listEvents(query: ListEventsQuery, includeUnpublished = false) {
  if (!includeUnpublished) {
    const cacheKey = `${EVENTS_LIST_PREFIX}${JSON.stringify(query)}`;
    const cached = await cacheGet<Awaited<ReturnType<typeof buildListEvents>>>(cacheKey);
    if (cached) return cached;
    const result = await buildListEvents(query, false);
    await cacheSet(cacheKey, result, EVENTS_LIST_TTL);
    return result;
  }
  return buildListEvents(query, true);
}

async function buildListEvents(query: ListEventsQuery, includeUnpublished: boolean) {
  const rows = await prisma.events.findMany({
    where: {
      ...(includeUnpublished ? (query.status ? { status: query.status } : {}) : { status: 'published', event_date: { gte: new Date() } }),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search ? { OR: [{ title: { contains: query.search } }, { venue: { contains: query.search } }] } : {}),
    },
    include: { seat_zones: { include: { seats: { select: { status: true } } } } },
  });
  let events = rows.map(normalizeEvent).filter((event) =>
    cityMatches(event.venue, query.city)
    && timeMatches(event.event_date, query.time_range)
    && (query.max_price === undefined || (event.min_price !== null && event.min_price <= query.max_price)));
  events.sort((a, b) => {
    const dir = query.order === 'desc' ? -1 : 1;
    if (query.sort === 'created_at') return dir * ((a.created_at?.getTime() ?? 0) - (b.created_at?.getTime() ?? 0));
    if (query.sort === 'sold') {
      const ar = a.total_seats ? (a.total_seats - a.available_seats) / a.total_seats : 0;
      const br = b.total_seats ? (b.total_seats - b.available_seats) / b.total_seats : 0;
      return dir * (ar - br);
    }
    if (query.sort === 'price') return dir * ((a.min_price ?? Number.MAX_SAFE_INTEGER) - (b.min_price ?? Number.MAX_SAFE_INTEGER));
    return dir * (a.event_date.getTime() - b.event_date.getTime());
  });
  const total = events.length;
  events = events.slice((query.page - 1) * query.limit, query.page * query.limit);
  return { events, pagination: { page: query.page, limit: query.limit, total, total_pages: Math.ceil(total / query.limit) } };
}

export async function getEventById(id: number, includeUnpublished = false) {
  if (!includeUnpublished) {
    const cacheKey = `${EVENT_DETAIL_PREFIX}${id}`;
    const cached = await cacheGet<Awaited<ReturnType<typeof buildEventDetail>>>(cacheKey);
    if (cached) return cached;
    const result = await buildEventDetail(id, false);
    await cacheSet(cacheKey, result, EVENT_DETAIL_TTL);
    return result;
  }
  return buildEventDetail(id, true);
}

async function buildEventDetail(id: number, includeUnpublished: boolean) {
  const event = await getRawEvent(id);
  if (!event || (!includeUnpublished && event.status !== 'published')) throw AppError.notFound('Event not found or not published', 'EVENT_NOT_FOUND');
  return { ...normalizeEvent(event), seat_zones: normalizeZones(event) };
}

export async function createEvent(userId: number, input: CreateEventInput) {
  const event = await prisma.events.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      seating_mode: input.seating_mode ?? 'seated',
      venue: input.venue,
      event_date: new Date(input.event_date),
      poster_url: input.poster_url ?? null,
      layout_config: input.layout_config,
      status: 'draft',
      created_by: userId,
    },
  });
  await invalidateEvent(event.id);
  return getEventById(event.id, true);
}

export async function updateEvent(id: number, input: UpdateEventInput) {
  const event = await prisma.events.findUnique({ where: { id }, include: { seat_zones: { select: { total_rows: true, total_cols: true } } } });
  if (!event) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
  // if (event.status !== 'draft') throw AppError.conflict('Only draft events can be edited', 'EVENT_NOT_EDITABLE');
  if (input.seating_mode !== undefined && input.seating_mode !== event.seating_mode && !zonesFitMode(input.seating_mode, event.seat_zones)) {
    throw AppError.conflict('Các khu vé hiện tại không khớp hình thức chỗ ngồi mới. Hãy chỉnh hoặc xóa khu vé trước.', 'SEATING_MODE_ZONE_MISMATCH');
  }
  if (Object.keys(input).length === 0) throw AppError.badRequest('No update data provided', 'VALIDATION_ERROR');
  const { event_date, layout_config, ...rest } = input;
  await prisma.events.update({
    where: { id },
    data: {
      ...rest,
      ...(event_date !== undefined && { event_date: new Date(event_date) }),
      ...(layout_config !== undefined && { layout_config: layout_config === null ? Prisma.JsonNull : layout_config }),
    },
  });
  await invalidateEvent(id);
  return getEventById(id, true);
}

export async function changeStatus(id: number, input: ChangeStatusInput) {
  let shouldClearQueue = false;
  await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<Array<{ id: number; status: EventStatus; event_date: Date; seating_mode: SeatingMode }>>`
      SELECT id, status, event_date, seating_mode FROM events WHERE id = ${id} FOR UPDATE
    `;
    const event = rows[0];
    if (!event) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
    const allowed: Record<EventStatus, EventStatus[]> = { draft: ['published', 'cancelled'], published: ['completed', 'cancelled'], completed: [], cancelled: [] };
    if (!allowed[event.status].includes(input.status)) throw AppError.conflict('Invalid event status transition', 'INVALID_STATUS_TRANSITION');
    const zones = await tx.seat_zones.findMany({ where: { event_id: id }, include: { seats: { select: { id: true } } } });
    if (input.status === 'published') {
      if (event.event_date <= new Date()) throw AppError.conflict('Không thể mở bán sự kiện đã qua thời gian diễn ra', 'EVENT_DATE_PASSED');
      if (!zones.length || zones.every((zone) => zone.seats.length === 0)) throw AppError.conflict('Cần cấu hình ít nhất một khu vé trước khi mở bán', 'EVENT_MISSING_SEAT_ZONES');
      if (!zonesFitMode(event.seating_mode, zones)) throw AppError.conflict('Khu vé không khớp hình thức chỗ ngồi hiện tại', 'SEATING_MODE_ZONE_MISMATCH');
    }
    if (input.status === 'cancelled') {
      const liveBookings = await tx.bookings.findMany({
        where: { event_id: id, status: { in: ['pending', 'confirmed'] } },
        select: { id: true, promo_code_id: true },
      });
      const promoCounts = new Map<number, number>();
      liveBookings.forEach((booking) => booking.promo_code_id && promoCounts.set(booking.promo_code_id, (promoCounts.get(booking.promo_code_id) ?? 0) + 1));
      for (const [promoId, count] of promoCounts) {
        const promo = await tx.promo_codes.findUnique({ where: { id: promoId }, select: { used_count: true } });
        await tx.promo_codes.update({ where: { id: promoId }, data: { used_count: Math.max(0, (promo?.used_count ?? 0) - count) } });
      }
      await tx.tickets.updateMany({ where: { bookings: { event_id: id }, status: { not: 'cancelled' } }, data: { status: 'cancelled' } });
      await tx.bookings.updateMany({ where: { event_id: id, status: { in: ['pending', 'confirmed'] } }, data: { status: 'cancelled' } });
      await tx.seats.updateMany({ where: { seat_zones: { event_id: id }, status: { not: 'available' } }, data: { status: 'available', locked_by: null, locked_at: null } });
      shouldClearQueue = true;
    }
    await tx.events.update({ where: { id }, data: { status: input.status } });
  });
  if (shouldClearQueue) await clearEventQueue(id);
  await invalidateEvent(id);
  return getEventById(id, true);
}

export async function deleteEvent(id: number) {
  const event = await prisma.events.findUnique({ where: { id }, select: { status: true } });
  if (!event) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
  // if (event.status !== 'draft') throw AppError.conflict('Only draft events can be deleted', 'EVENT_NOT_EDITABLE');
  await prisma.events.delete({ where: { id } });
  await invalidateEvent(id);
}

export async function completePastPublishedEvents() {
  const rows = await prisma.events.findMany({
    where: { status: 'published', event_date: { lt: new Date() } },
    select: { id: true },
  });
  const ids = rows.map((row) => row.id);
  if (!ids.length) return [];
  await prisma.events.updateMany({ where: { id: { in: ids }, status: 'published' }, data: { status: 'completed' } });
  await Promise.all(ids.map((id) => redis.del(`${EVENT_DETAIL_PREFIX}${id}`)));
  await invalidateEventLists();
  return ids;
}
