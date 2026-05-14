import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import redis from '../../config/redis';
import { AppError } from '../../shared/AppError';
import type { ListEventsQuery, CreateEventInput, UpdateEventInput, ChangeStatusInput } from './validation';

type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

const EVENTS_LIST_TTL = 60;
const EVENT_DETAIL_TTL = 30;
const EVENTS_LIST_PREFIX = 'events:list:';
const EVENT_DETAIL_PREFIX = 'events:detail:';

async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  try { await redis.setex(key, ttl, JSON.stringify(value)); } catch { /* ignore */ }
}

async function invalidateEvent(id: number): Promise<void> {
  try {
    await redis.del(`${EVENT_DETAIL_PREFIX}${id}`);
    const keys = await redis.keys(`${EVENTS_LIST_PREFIX}*`);
    if (keys.length) await redis.del(...keys);
  } catch { /* ignore */ }
}

interface EventRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  category: string;
  venue: string;
  event_date: string;
  poster_url: string | null;
  status: EventStatus;
  queue_enabled: number;
  created_by: number;
  created_at: string;
  min_price: number | null;
  max_price: number | null;
  available_seats: number;
  total_seats: number;
  average_rating: number | null;
  review_count: number;
}

interface SeatZoneRow extends RowDataPacket {
  id: number;
  event_id: number;
  name: string;
  price: number;
  color: string;
  total_rows: number;
  total_cols: number;
  available_seats: number;
  total_seats: number;
}

const eventSelect = `
  SELECT e.id, e.title, e.description, e.category, e.venue, e.event_date,
         e.poster_url, e.status, e.queue_enabled, e.created_by, e.created_at,
         stats.min_price,
         stats.max_price,
         COALESCE(stats.total_seats, 0) AS total_seats,
         COALESCE(stats.available_seats, 0) AS available_seats,
         reviews.average_rating,
         COALESCE(reviews.review_count, 0) AS review_count
  FROM events e
  LEFT JOIN (
    SELECT sz.event_id,
           MIN(sz.price) AS min_price,
           MAX(sz.price) AS max_price,
           COUNT(s.id) AS total_seats,
           SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_seats
    FROM seat_zones sz
    LEFT JOIN seats s ON s.zone_id = sz.id
    GROUP BY sz.event_id
  ) stats ON stats.event_id = e.id
  LEFT JOIN (
    SELECT event_id, AVG(rating) AS average_rating, COUNT(*) AS review_count
    FROM reviews
    GROUP BY event_id
  ) reviews ON reviews.event_id = e.id
`;

function normalizeEvent(row: EventRow) {
  return {
    ...row,
    min_price: row.min_price === null ? null : Number(row.min_price),
    max_price: row.max_price === null ? null : Number(row.max_price),
    available_seats: Number(row.available_seats ?? 0),
    total_seats: Number(row.total_seats ?? 0),
    average_rating: row.average_rating === null ? null : Number(row.average_rating),
    review_count: Number(row.review_count ?? 0),
    queue_enabled: Boolean(row.queue_enabled),
  };
}

async function getEventRecord(id: number) {
  const [rows] = await pool.execute<EventRow[]>(`${eventSelect} WHERE e.id = ?`, [id]);
  return rows[0] ? normalizeEvent(rows[0]) : null;
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
  const { category, status, search, page, limit, sort, order } = query;
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (includeUnpublished) {
    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }
  } else {
    conditions.push('e.status = ?');
    params.push('published');
  }

  if (category) {
    conditions.push('e.category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(e.title LIKE ? OR e.venue LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderCol = sort === 'created_at' ? 'e.created_at' : 'e.event_date';
  const orderDir = order === 'desc' ? 'DESC' : 'ASC';

  const [rows] = await pool.query<EventRow[]>(
    `${eventSelect}
     ${where}
     ORDER BY ${orderCol} ${orderDir}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)],
  );

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM events e ${where}`,
    params,
  );
  const total = Number(countRows[0]?.total ?? 0);

  return {
    events: rows.map(normalizeEvent),
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
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
  const event = await getEventRecord(id);
  if (!event || (!includeUnpublished && event.status !== 'published')) {
    throw AppError.notFound('Event not found or not published', 'EVENT_NOT_FOUND');
  }

  const [zones] = await pool.execute<SeatZoneRow[]>(
    `SELECT sz.id, sz.event_id, sz.name, sz.price, sz.color, sz.total_rows, sz.total_cols,
            COUNT(s.id) AS total_seats,
            SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_seats
     FROM seat_zones sz
     LEFT JOIN seats s ON s.zone_id = sz.id
     WHERE sz.event_id = ?
     GROUP BY sz.id
     ORDER BY sz.price ASC, sz.id ASC`,
    [id],
  );

  return {
    ...event,
    seat_zones: zones.map((zone) => ({
      ...zone,
      price: Number(zone.price),
      available_seats: Number(zone.available_seats ?? 0),
      total_seats: Number(zone.total_seats ?? 0),
    })),
  };
}

export async function createEvent(userId: number, input: CreateEventInput) {
  const { title, description, category, seating_mode, venue, event_date, poster_url } = input;
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO events (title, description, category, seating_mode, venue, event_date, poster_url, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
    [title, description ?? null, category, seating_mode ?? 'seated', venue, event_date, poster_url ?? null, userId],
  );
  await invalidateEvent(result.insertId);
  return getEventById(result.insertId, true);
}

export async function updateEvent(id: number, input: UpdateEventInput) {
  const [eventRows] = await pool.execute<(RowDataPacket & { id: number; status: EventStatus })[]>(
    'SELECT id, status FROM events WHERE id = ?',
    [id],
  );
  if (eventRows.length === 0) {
    throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
  }
  if (eventRows[0].status !== 'draft') {
    throw AppError.conflict('Only draft events can be edited', 'EVENT_NOT_EDITABLE');
  }

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.title !== undefined)         { fields.push('title = ?');         values.push(input.title); }
  if (input.description !== undefined)   { fields.push('description = ?');   values.push(input.description); }
  if (input.category !== undefined)      { fields.push('category = ?');      values.push(input.category); }
  if (input.seating_mode !== undefined)  { fields.push('seating_mode = ?');  values.push(input.seating_mode); }
  if (input.venue !== undefined)         { fields.push('venue = ?');         values.push(input.venue); }
  if (input.event_date !== undefined)    { fields.push('event_date = ?');    values.push(input.event_date); }
  if (input.poster_url !== undefined)    { fields.push('poster_url = ?');    values.push(input.poster_url); }
  if (input.queue_enabled !== undefined) { fields.push('queue_enabled = ?'); values.push(input.queue_enabled ? 1 : 0); }

  if (fields.length === 0) {
    throw AppError.badRequest('No update data provided', 'VALIDATION_ERROR');
  }

  values.push(id);
  await pool.execute(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);
  await invalidateEvent(id);
  return getEventById(id, true);
}

export async function changeStatus(id: number, input: ChangeStatusInput) {
  const [rows] = await pool.execute<(RowDataPacket & { id: number; status: EventStatus })[]>(
    'SELECT id, status FROM events WHERE id = ?',
    [id],
  );
  if (rows.length === 0) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');

  const currentStatus = rows[0].status;
  const nextStatus = input.status;
  const allowedTransitions: Record<EventStatus, EventStatus[]> = {
    draft: ['published'],
    published: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw AppError.conflict('Invalid event status transition', 'INVALID_STATUS_TRANSITION');
  }

  await pool.execute('UPDATE events SET status = ? WHERE id = ?', [nextStatus, id]);
  await invalidateEvent(id);
  return getEventById(id, true);
}

export async function deleteEvent(id: number) {
  const [rows] = await pool.execute<(RowDataPacket & { id: number; status: EventStatus })[]>(
    'SELECT id, status FROM events WHERE id = ?',
    [id],
  );
  if (rows.length === 0) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
  if (rows[0].status !== 'draft') {
    throw AppError.conflict('Only draft events can be deleted', 'EVENT_NOT_EDITABLE');
  }

  await pool.execute('DELETE FROM events WHERE id = ?', [id]);
  await invalidateEvent(id);
}
