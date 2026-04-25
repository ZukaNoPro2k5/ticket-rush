import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import type { ListEventsQuery, CreateEventInput, UpdateEventInput, ChangeStatusInput } from './validation';

interface EventRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  category: string;
  venue: string;
  event_date: string;
  poster_url: string | null;
  status: string;
  created_by: number;
  created_at: string;
  min_price: number | null;
}

interface SeatZoneRow extends RowDataPacket {
  id: number;
  event_id: number;
  name: string;
  price: number;
  color: string;
  total_rows: number;
  total_cols: number;
}

export async function listEvents(query: ListEventsQuery) {
  const { category, status = 'published', search, page, limit, sort, order } = query;
  const offset = (page - 1) * limit;

  const conditions: string[] = ['e.status = ?'];
  const params: (string | number)[] = [status];

  if (category) {
    conditions.push('e.category = ?');
    params.push(category);
  }
  if (search) {
    conditions.push('(e.title LIKE ? OR e.venue LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.join(' AND ');
  const orderCol = sort === 'created_at' ? 'e.created_at' : 'e.event_date';
  const orderDir = order === 'desc' ? 'DESC' : 'ASC';

  const [rows] = await pool.query<EventRow[]>(
    `SELECT e.id, e.title, e.description, e.category, e.venue, e.event_date,
            e.poster_url, e.status, e.created_by, e.created_at,
            MIN(sz.price) AS min_price
     FROM events e
     LEFT JOIN seat_zones sz ON sz.event_id = e.id
     WHERE ${where}
     GROUP BY e.id
     ORDER BY ${orderCol} ${orderDir}
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)],
  );

  const [[countRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT e.id) AS total FROM events e WHERE ${where}`,
    params,
  );
  const total = (countRow as RowDataPacket).total as number;

  return {
    events: rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

export async function getEventById(id: number) {
  const [rows] = await pool.execute<EventRow[]>(
    `SELECT e.id, e.title, e.description, e.category, e.venue, e.event_date,
            e.poster_url, e.status, e.created_by, e.created_at,
            MIN(sz.price) AS min_price
     FROM events e
     LEFT JOIN seat_zones sz ON sz.event_id = e.id
     WHERE e.id = ? AND e.status = 'published'
     GROUP BY e.id`,
    [id],
  );

  if (rows.length === 0) {
    throw AppError.notFound('Sự kiện không tồn tại hoặc chưa được công bố', 'EVENT_NOT_FOUND');
  }

  const [zones] = await pool.execute<SeatZoneRow[]>(
    'SELECT id, event_id, name, price, color, total_rows, total_cols FROM seat_zones WHERE event_id = ? ORDER BY price ASC',
    [id],
  );

  return { ...rows[0], seat_zones: zones };
}

export async function createEvent(userId: number, input: CreateEventInput) {
  const { title, description, category, venue, event_date, poster_url } = input;
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.execute(
      `INSERT INTO events (title, description, category, venue, event_date, poster_url, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)`,
      [title, description ?? null, category, venue, event_date, poster_url ?? null, userId],
    );
    const insertId = (result as { insertId: number }).insertId;
    const [rows] = await conn.execute<EventRow[]>('SELECT * FROM events WHERE id = ?', [insertId]);
    return rows[0];
  } finally {
    conn.release();
  }
}

export async function updateEvent(id: number, input: UpdateEventInput) {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (input.title !== undefined)       { fields.push('title = ?');       values.push(input.title); }
  if (input.description !== undefined) { fields.push('description = ?'); values.push(input.description); }
  if (input.category !== undefined)    { fields.push('category = ?');    values.push(input.category); }
  if (input.venue !== undefined)       { fields.push('venue = ?');       values.push(input.venue); }
  if (input.event_date !== undefined)  { fields.push('event_date = ?');  values.push(input.event_date); }
  if (input.poster_url !== undefined)  { fields.push('poster_url = ?');  values.push(input.poster_url); }

  if (fields.length === 0) throw AppError.badRequest('Không có dữ liệu cập nhật');

  values.push(id);
  await pool.execute(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values);

  const [rows] = await pool.execute<EventRow[]>('SELECT * FROM events WHERE id = ?', [id]);
  if (rows.length === 0) throw AppError.notFound('Sự kiện không tồn tại');
  return rows[0];
}

export async function changeStatus(id: number, input: ChangeStatusInput) {
  const [check] = await pool.execute<EventRow[]>('SELECT id FROM events WHERE id = ?', [id]);
  if (check.length === 0) throw AppError.notFound('Sự kiện không tồn tại');

  await pool.execute('UPDATE events SET status = ? WHERE id = ?', [input.status, id]);
  const [rows] = await pool.execute<EventRow[]>('SELECT * FROM events WHERE id = ?', [id]);
  return rows[0];
}

export async function deleteEvent(id: number) {
  const [check] = await pool.execute<EventRow[]>('SELECT id FROM events WHERE id = ?', [id]);
  if (check.length === 0) throw AppError.notFound('Sự kiện không tồn tại');
  await pool.execute('DELETE FROM events WHERE id = ?', [id]);
}
