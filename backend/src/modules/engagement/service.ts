import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';

async function assertExists(table: 'events' | 'posts', id: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM ${table} WHERE id = ? LIMIT 1`,
    [id],
  );
  if (rows.length === 0) {
    throw AppError.notFound(table === 'events' ? 'Sự kiện không tồn tại' : 'Bài đăng không tồn tại');
  }
}

export async function getEventFavorite(userId: number, eventId: number) {
  await assertExists('events', eventId);
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT 1 FROM event_favorites WHERE user_id = ? AND event_id = ? LIMIT 1',
    [userId, eventId],
  );
  return { saved: rows.length > 0 };
}

export async function listEventFavorites(userId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT e.id, e.title, e.description, e.category, e.seating_mode, e.venue, e.event_date,
            e.poster_url, e.status, e.queue_enabled, e.created_by, e.created_at,
            stats.min_price, stats.max_price, stats.available_seats, stats.total_seats
     FROM event_favorites ef
     JOIN events e ON e.id = ef.event_id
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
     WHERE ef.user_id = ? AND e.status = 'published'
     ORDER BY ef.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function saveEventFavorite(userId: number, eventId: number) {
  await assertExists('events', eventId);
  await pool.execute<ResultSetHeader>(
    `INSERT INTO event_favorites (user_id, event_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE created_at = created_at`,
    [userId, eventId],
  );
  return { saved: true };
}

export async function removeEventFavorite(userId: number, eventId: number) {
  await pool.execute<ResultSetHeader>(
    'DELETE FROM event_favorites WHERE user_id = ? AND event_id = ?',
    [userId, eventId],
  );
  return { saved: false };
}

export async function getPostBookmark(userId: number, postId: number) {
  await assertExists('posts', postId);
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT 1 FROM post_bookmarks WHERE user_id = ? AND post_id = ? LIMIT 1',
    [userId, postId],
  );
  return { saved: rows.length > 0 };
}

export async function savePostBookmark(userId: number, postId: number) {
  await assertExists('posts', postId);
  await pool.execute<ResultSetHeader>(
    `INSERT INTO post_bookmarks (user_id, post_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE created_at = created_at`,
    [userId, postId],
  );
  return { saved: true };
}

export async function removePostBookmark(userId: number, postId: number) {
  await pool.execute<ResultSetHeader>(
    'DELETE FROM post_bookmarks WHERE user_id = ? AND post_id = ?',
    [userId, postId],
  );
  return { saved: false };
}

export async function subscribeNewsletter(email: string, userId?: number) {
  await pool.execute<ResultSetHeader>(
    `INSERT INTO newsletter_subscriptions (email, user_id, status)
     VALUES (?, ?, 'active')
     ON DUPLICATE KEY UPDATE
       user_id = COALESCE(VALUES(user_id), user_id),
       status = 'active',
       unsubscribed_at = NULL`,
    [email.trim().toLowerCase(), userId ?? null],
  );
  return { subscribed: true };
}
