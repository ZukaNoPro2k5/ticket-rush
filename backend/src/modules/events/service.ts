import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import redis from '../../config/redis';
import { AppError } from '../../shared/AppError';
import { clearEventQueue } from '../queue/service';
import type { ListEventsQuery, CreateEventInput, UpdateEventInput, ChangeStatusInput } from './validation';

type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
type SeatingMode = 'seated' | 'zoned' | 'admission';

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

async function invalidateEventLists(): Promise<void> {
  try {
    const keys = await redis.keys(`${EVENTS_LIST_PREFIX}*`);
    if (keys.length) await redis.del(...keys);
  } catch { /* ignore */ }
}

interface EventRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  category: string;
  seating_mode: SeatingMode;
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

interface ZoneShapeRow extends RowDataPacket {
  total_rows: number;
  total_cols: number;
}

const eventStatsJoin = `
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
`;

const eventSelect = `
  SELECT e.id, e.title, e.description, e.category, e.seating_mode, e.venue, e.event_date,
         e.poster_url, e.status, e.queue_enabled, e.created_by, e.created_at,
         stats.min_price,
         stats.max_price,
         COALESCE(stats.total_seats, 0) AS total_seats,
         COALESCE(stats.available_seats, 0) AS available_seats
  FROM events e
  ${eventStatsJoin}
`;

function normalizeEvent(row: EventRow) {
  return {
    ...row,
    min_price: row.min_price === null ? null : Number(row.min_price),
    max_price: row.max_price === null ? null : Number(row.max_price),
    available_seats: Number(row.available_seats ?? 0),
    total_seats: Number(row.total_seats ?? 0),
    queue_enabled: Boolean(row.queue_enabled),
  };
}

async function getEventRecord(id: number) {
  const [rows] = await pool.execute<EventRow[]>(`${eventSelect} WHERE e.id = ?`, [id]);
  return rows[0] ? normalizeEvent(rows[0]) : null;
}

function zonesFitMode(mode: SeatingMode, zones: ZoneShapeRow[]) {
  return zones.every((zone) => {
    const rows = Number(zone.total_rows);
    const cols = Number(zone.total_cols);
    if (mode === 'seated') return rows >= 1 && rows <= 26 && cols >= 1 && cols <= 50;
    return rows === 1 && cols >= 1 && cols <= 99999;
  });
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
  const { category, status, search, city, time_range, max_price, page, limit, sort, order } = query;
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
    conditions.push('e.event_date >= NOW()');
  }

  if (category) {
    conditions.push('e.category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(e.title LIKE ? OR e.venue LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (city) {
    const cityAliases: Record<NonNullable<ListEventsQuery['city']>, string[]> = {
      'ha-noi': ['%Hà Nội%', '%Ha Noi%'],
      'ho-chi-minh': ['%Hồ Chí Minh%', '%Ho Chi Minh%', '%TP.HCM%', '%TP. HCM%', '%HCM%'],
      'da-nang': ['%Đà Nẵng%', '%Da Nang%'],
      'hai-phong': ['%Hải Phòng%', '%Hai Phong%'],
      hue: ['%Huế%', '%Hue%'],
      other: [],
    };
    const aliases = cityAliases[city];
    if (city === 'other') {
      const knownAliases = Object.entries(cityAliases)
        .filter(([key]) => key !== 'other')
        .flatMap(([, values]) => values);
      conditions.push(`(${knownAliases.map(() => 'e.venue NOT LIKE ?').join(' AND ')})`);
      params.push(...knownAliases);
    } else {
      conditions.push(`(${aliases.map(() => 'e.venue LIKE ?').join(' OR ')})`);
      params.push(...aliases);
    }
  }

  if (time_range === 'today') {
    conditions.push('DATE(e.event_date) = CURDATE()');
  } else if (time_range === 'weekend') {
    conditions.push('DAYOFWEEK(e.event_date) IN (1, 7)');
  } else if (time_range === 'week') {
    conditions.push('e.event_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)');
  } else if (time_range === 'month') {
    conditions.push('e.event_date <= DATE_ADD(NOW(), INTERVAL 30 DAY)');
  } else if (time_range === 'next_month') {
    conditions.push('YEAR(e.event_date) = YEAR(DATE_ADD(NOW(), INTERVAL 1 MONTH))');
    conditions.push('MONTH(e.event_date) = MONTH(DATE_ADD(NOW(), INTERVAL 1 MONTH))');
  } else if (time_range === 'other') {
    conditions.push('e.event_date > LAST_DAY(DATE_ADD(NOW(), INTERVAL 1 MONTH))');
  }

  if (max_price !== undefined) {
    conditions.push('stats.min_price IS NOT NULL AND stats.min_price <= ?');
    params.push(max_price);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderCol = sort === 'created_at'
    ? 'e.created_at'
    : sort === 'sold'
      ? 'CASE WHEN COALESCE(stats.total_seats, 0) = 0 THEN 0 ELSE (stats.total_seats - stats.available_seats) / stats.total_seats END'
      : sort === 'price'
        ? 'COALESCE(stats.min_price, 999999999)'
      : 'e.event_date';
  const orderDir = order === 'desc' ? 'DESC' : 'ASC';

  const [rows] = await pool.query<EventRow[]>(
    `${eventSelect}
     ${where}
     ORDER BY ${orderCol} ${orderDir}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)],
  );

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM events e
     ${eventStatsJoin}
     ${where}`,
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
  const [eventRows] = await pool.execute<(RowDataPacket & {
    id: number;
    status: EventStatus;
    seating_mode: SeatingMode;
  })[]>(
    'SELECT id, status, seating_mode FROM events WHERE id = ?',
    [id],
  );
  if (eventRows.length === 0) {
    throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');
  }
  if (eventRows[0].status !== 'draft') {
    throw AppError.conflict('Only draft events can be edited', 'EVENT_NOT_EDITABLE');
  }

  if (input.seating_mode !== undefined && input.seating_mode !== eventRows[0].seating_mode) {
    const [zones] = await pool.execute<ZoneShapeRow[]>(
      'SELECT total_rows, total_cols FROM seat_zones WHERE event_id = ?',
      [id],
    );
    if (!zonesFitMode(input.seating_mode, zones)) {
      throw AppError.conflict(
        'Các khu vé hiện tại không khớp hình thức chỗ ngồi mới. Hãy chỉnh hoặc xóa khu vé trước.',
        'SEATING_MODE_ZONE_MISMATCH',
      );
    }
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
  const conn = await pool.getConnection();
  let shouldClearQueue = false;
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute<(RowDataPacket & {
      id: number;
      status: EventStatus;
      event_date: string;
      seating_mode: SeatingMode;
    })[]>(
      'SELECT id, status, event_date, seating_mode FROM events WHERE id = ? FOR UPDATE',
      [id],
    );
    if (rows.length === 0) throw AppError.notFound('Event not found', 'EVENT_NOT_FOUND');

    const currentStatus = rows[0].status;
    const nextStatus = input.status;
    const allowedTransitions: Record<EventStatus, EventStatus[]> = {
      draft: ['published', 'cancelled'],
      published: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw AppError.conflict('Invalid event status transition', 'INVALID_STATUS_TRANSITION');
    }

    if (nextStatus === 'published') {
      if (new Date(rows[0].event_date) <= new Date()) {
        throw AppError.conflict('Không thể mở bán sự kiện đã qua thời gian diễn ra', 'EVENT_DATE_PASSED');
      }
      const [[zoneStats]] = await conn.query<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT sz.id) AS zones, COUNT(s.id) AS seats
         FROM seat_zones sz
         LEFT JOIN seats s ON s.zone_id = sz.id
         WHERE sz.event_id = ?`,
        [id],
      );
      if (Number(zoneStats.zones ?? 0) === 0 || Number(zoneStats.seats ?? 0) === 0) {
        throw AppError.conflict(
          'Cần cấu hình ít nhất một khu vé trước khi mở bán',
          'EVENT_MISSING_SEAT_ZONES',
        );
      }
      const [zones] = await conn.execute<ZoneShapeRow[]>(
        'SELECT total_rows, total_cols FROM seat_zones WHERE event_id = ?',
        [id],
      );
      if (!zonesFitMode(rows[0].seating_mode, zones)) {
        throw AppError.conflict(
          'Khu vé không khớp hình thức chỗ ngồi hiện tại',
          'SEATING_MODE_ZONE_MISMATCH',
        );
      }
    }

    if (nextStatus === 'cancelled') {
      // Restore promo capacity for every live booking that the cancellation voids.
      await conn.execute(
        `UPDATE promo_codes p
         JOIN (
           SELECT promo_code_id, COUNT(*) AS uses_to_restore
           FROM bookings
           WHERE event_id = ?
             AND status IN ('pending', 'confirmed')
             AND promo_code_id IS NOT NULL
           GROUP BY promo_code_id
         ) x ON x.promo_code_id = p.id
         SET p.used_count = GREATEST(p.used_count - x.uses_to_restore, 0)`,
        [id],
      );

      // Paid tickets become unusable; pending and confirmed bookings both stop
      // participating in revenue/operations once the event itself is void.
      await conn.execute(
        `UPDATE tickets t
         JOIN bookings b ON b.id = t.booking_id
         SET t.status = 'cancelled'
         WHERE b.event_id = ? AND t.status <> 'cancelled'`,
        [id],
      );
      await conn.execute(
        `UPDATE bookings
         SET status = 'cancelled'
         WHERE event_id = ? AND status IN ('pending', 'confirmed')`,
        [id],
      );
      await conn.execute(
        `UPDATE seats s
         JOIN seat_zones sz ON sz.id = s.zone_id
         SET s.status = 'available', s.locked_by = NULL, s.locked_at = NULL
         WHERE sz.event_id = ? AND s.status <> 'available'`,
        [id],
      );
      shouldClearQueue = true;
    }

    await conn.execute('UPDATE events SET status = ? WHERE id = ?', [nextStatus, id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  if (shouldClearQueue) {
    await clearEventQueue(id);
  }
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

/**
 * Safety-net lifecycle worker: once the scheduled time has passed, a still-open
 * public event should stop being sold and disappear from public discovery.
 */
export async function completePastPublishedEvents() {
  const [rows] = await pool.query<(RowDataPacket & { id: number })[]>(
    `SELECT id
     FROM events
     WHERE status = 'published' AND event_date < NOW()`,
  );
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => '?').join(', ');
  await pool.execute(
    `UPDATE events SET status = 'completed'
     WHERE id IN (${placeholders}) AND status = 'published'`,
    ids,
  );

  await Promise.all(ids.map((eventId) => redis.del(`${EVENT_DETAIL_PREFIX}${eventId}`)));
  await invalidateEventLists();
  return ids;
}
