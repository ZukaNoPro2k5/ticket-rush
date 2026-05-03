import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import type { CreateReviewInput } from './validation';

interface ReviewRow extends RowDataPacket {
  id: number;
  user_id: number;
  event_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  full_name: string;
}

export async function listReviews(eventId: number) {
  const [rows] = await pool.execute<ReviewRow[]>(
    `SELECT r.id, r.user_id, r.event_id, r.rating, r.comment, r.created_at,
            u.full_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.event_id = ?
     ORDER BY r.created_at DESC`,
    [eventId],
  );

  const [aggRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, AVG(rating) AS avg_rating FROM reviews WHERE event_id = ?`,
    [eventId],
  );

  return {
    reviews: rows,
    total: Number(aggRows[0].total),
    avg_rating: aggRows[0].avg_rating ? Number(Number(aggRows[0].avg_rating).toFixed(1)) : null,
  };
}

export async function createReview(userId: number, eventId: number, input: CreateReviewInput) {
  // Guard 1: Event must be completed
  const [eventRows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM events WHERE id = ? AND status = 'completed'",
    [eventId],
  );
  if (eventRows.length === 0) {
    throw AppError.forbidden('Chỉ đánh giá sau khi sự kiện kết thúc', 'EVENT_NOT_COMPLETED');
  }

  // Guard 2: User must have a confirmed ticket for this event
  const [ticketRows] = await pool.execute<RowDataPacket[]>(
    `SELECT t.id FROM tickets t
     JOIN booking_seats bs ON bs.id = t.booking_seat_id
     JOIN bookings b ON b.id = bs.booking_id
     JOIN seats s ON s.id = bs.seat_id
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE b.user_id = ? AND sz.event_id = ? AND b.status = 'confirmed'
     LIMIT 1`,
    [userId, eventId],
  );
  if (ticketRows.length === 0) {
    throw AppError.forbidden('Bạn cần có vé hợp lệ để đánh giá', 'NO_TICKET');
  }

  // Guard 3: One review per user per event
  const [existing] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM reviews WHERE user_id = ? AND event_id = ?',
    [userId, eventId],
  );
  if (existing.length > 0) {
    throw AppError.badRequest('Bạn đã đánh giá sự kiện này rồi', 'ALREADY_REVIEWED');
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO reviews (user_id, event_id, rating, comment) VALUES (?, ?, ?, ?)',
    [userId, eventId, input.rating, input.comment ?? null],
  );

  const [rows] = await pool.execute<ReviewRow[]>(
    `SELECT r.id, r.user_id, r.event_id, r.rating, r.comment, r.created_at,
            u.full_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.id = ?`,
    [result.insertId],
  );

  return rows[0];
}

export async function deleteReview(userId: number, reviewId: number, isAdmin: boolean) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, user_id FROM reviews WHERE id = ?',
    [reviewId],
  );
  if (rows.length === 0) throw AppError.notFound('Đánh giá không tồn tại');
  if (!isAdmin && rows[0].user_id !== userId) {
    throw AppError.forbidden('Không có quyền xóa đánh giá này');
  }
  await pool.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
}
