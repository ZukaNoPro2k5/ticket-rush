<<<<<<< Updated upstream
// TODO: Dev 3 — Reviews service
=======
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

function toLegacyReview(row: ReviewRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    event_id: row.event_id,
    rating: Number(row.rating),
    comment: row.comment,
    created_at: row.created_at,
    full_name: row.full_name,
  };
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
    'SELECT COUNT(*) AS total, AVG(rating) AS avg_rating FROM reviews WHERE event_id = ?',
    [eventId],
  );

  const reviews = rows.map(toLegacyReview);
  const total = Number(aggRows[0]?.total ?? 0);
  const avgRating = aggRows[0]?.avg_rating
    ? Number(Number(aggRows[0].avg_rating).toFixed(1))
    : null;

  return {
    reviews,
    total,
    avg_rating: avgRating,
    items: reviews.map((review) => ({
      id: review.id,
      user: { id: review.user_id, full_name: review.full_name },
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
    })),
    summary: { average_rating: avgRating, total },
  };
}

export async function createReview(userId: number, eventId: number, input: CreateReviewInput) {
  const [eventRows] = await pool.execute<(RowDataPacket & { status: string })[]>(
    'SELECT status FROM events WHERE id = ?',
    [eventId],
  );
  if (eventRows.length === 0) {
    throw AppError.notFound('Su kien khong ton tai', 'EVENT_NOT_FOUND');
  }
  if (eventRows[0].status !== 'completed') {
    throw AppError.forbidden('Chi danh gia sau khi su kien ket thuc', 'EVENT_NOT_COMPLETED');
  }

  const [ticketRows] = await pool.execute<RowDataPacket[]>(
    `SELECT t.id
     FROM tickets t
     JOIN bookings b ON b.id = t.booking_id
     JOIN seats s ON s.id = t.seat_id
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE b.user_id = ?
       AND b.event_id = ?
       AND sz.event_id = ?
       AND b.status = 'confirmed'
       AND t.status IN ('active', 'used')
     LIMIT 1`,
    [userId, eventId, eventId],
  );
  if (ticketRows.length === 0) {
    throw AppError.forbidden('Ban can co ve hop le de danh gia', 'NO_TICKET');
  }

  const [existing] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM reviews WHERE user_id = ? AND event_id = ?',
    [userId, eventId],
  );
  if (existing.length > 0) {
    throw AppError.conflict('Ban da danh gia su kien nay roi', 'ALREADY_REVIEWED');
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

  return toLegacyReview(rows[0]);
}

export async function deleteReview(userId: number, reviewId: number, isAdmin: boolean) {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, user_id FROM reviews WHERE id = ?',
    [reviewId],
  );
  if (rows.length === 0) throw AppError.notFound('Danh gia khong ton tai', 'REVIEW_NOT_FOUND');
  if (!isAdmin && rows[0].user_id !== userId) {
    throw AppError.forbidden('Khong co quyen xoa danh gia nay');
  }
  await pool.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
}
>>>>>>> Stashed changes
