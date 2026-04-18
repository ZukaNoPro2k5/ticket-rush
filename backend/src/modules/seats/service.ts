import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';

interface SeatRow extends RowDataPacket {
  id: number;
  zone_id: number;
  row_label: string;
  col_number: number;
  status: string;
}

// TODO: Dev 2 — listByEvent

/**
 * Lock ghế cho user — sử dụng SELECT ... FOR UPDATE để tránh race condition
 * Trả về danh sách ghế đã lock thành công
 */
export async function lockSeats(seatIds: number[], userId: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Row-level lock: SELECT ... FOR UPDATE
    const placeholders = seatIds.map(() => '?').join(', ');
    const [rows] = await conn.execute<SeatRow[]>(
      `SELECT id, status FROM seats WHERE id IN (${placeholders}) FOR UPDATE`,
      seatIds,
    );

    if (rows.length !== seatIds.length) {
      throw AppError.notFound('Một số ghế không tồn tại');
    }

    const unavailable = rows.filter((r) => r.status !== 'available');
    if (unavailable.length > 0) {
      throw AppError.conflict(
        `${unavailable.length} ghế đã bị người khác giữ hoặc đã bán`,
        'SEATS_UNAVAILABLE',
      );
    }

    // Lock ghế
    await conn.execute<ResultSetHeader>(
      `UPDATE seats SET status = 'locked', locked_by = ?, locked_at = NOW()
       WHERE id IN (${placeholders})`,
      [userId, ...seatIds],
    );

    await conn.commit();
    return seatIds;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Release ghế (khi hủy booking hoặc cronjob hết hạn)
 */
export async function releaseSeats(seatIds: number[]) {
  if (seatIds.length === 0) return;

  const placeholders = seatIds.map(() => '?').join(', ');
  await pool.execute<ResultSetHeader>(
    `UPDATE seats SET status = 'available', locked_by = NULL, locked_at = NULL
     WHERE id IN (${placeholders})`,
    seatIds,
  );
}

/**
 * Mark ghế đã bán (khi confirm booking)
 */
export async function markSold(seatIds: number[]) {
  if (seatIds.length === 0) return;

  const placeholders = seatIds.map(() => '?').join(', ');
  await pool.execute<ResultSetHeader>(
    `UPDATE seats SET status = 'sold', locked_by = NULL, locked_at = NULL
     WHERE id IN (${placeholders})`,
    seatIds,
  );
}

/**
 * Cronjob: tìm và release ghế locked quá 10 phút
 */
export async function releaseExpiredSeats() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT s.id FROM seats s
     WHERE s.status = 'locked' AND s.locked_at < DATE_SUB(NOW(), INTERVAL 10 MINUTE)`,
  );

  const seatIds = rows.map((r) => r.id as number);
  if (seatIds.length > 0) {
    await releaseSeats(seatIds);
  }
  return seatIds;
}
