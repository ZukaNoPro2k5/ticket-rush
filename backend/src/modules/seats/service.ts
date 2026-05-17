import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import { getBookingRules } from '../../config/runtimeSettings';

interface SeatRow extends RowDataPacket {
  id: number;
  zone_id: number;
  zone_name: string;
  zone_color: string;
  zone_price: number;
  row_label: string;
  col_number: number;
  status: string;
}

function normalizeSeat(row: SeatRow) {
  return {
    ...row,
    zone_price: Number(row.zone_price),
  };
}

/**
 * A6 — List all seats for an event with zone info
 */
export async function listByEvent(eventId: number) {
  const [rows] = await pool.execute<SeatRow[]>(
    `SELECT
       s.id, s.zone_id,
       sz.name AS zone_name, sz.color AS zone_color, sz.price AS zone_price,
       s.row_label, s.col_number, s.status
     FROM seats s
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE sz.event_id = ?
     ORDER BY sz.id, s.row_label, s.col_number`,
    [eventId],
  );
  return rows.map(normalizeSeat);
}

/**
 * List seats for one zone within an event.
 * Keeping the event guard avoids leaking a valid zone id across events.
 */
export async function listByZone(eventId: number, zoneId: number) {
  const [rows] = await pool.execute<SeatRow[]>(
    `SELECT
       s.id, s.zone_id,
       sz.name AS zone_name, sz.color AS zone_color, sz.price AS zone_price,
       s.row_label, s.col_number, s.status
     FROM seats s
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE sz.event_id = ? AND sz.id = ?
     ORDER BY s.row_label, s.col_number`,
    [eventId, zoneId],
  );
  return rows.map(normalizeSeat);
}

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
 * Cronjob: tìm và release ghế locked quá thời gian giữ vé hiện tại
 */
export async function releaseExpiredSeats() {
  const { ticketHoldMinutes } = await getBookingRules();
  const cutoff = new Date(Date.now() - ticketHoldMinutes * 60 * 1000);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT s.id
     FROM seats s
     WHERE s.status = 'locked'
       AND s.locked_at < ?
       AND NOT EXISTS (
         SELECT 1
         FROM booking_seats bs
         JOIN bookings b ON b.id = bs.booking_id
         WHERE bs.seat_id = s.id AND b.status = 'pending'
       )`,
    [cutoff],
  );

  const seatIds = rows.map((r) => r.id as number);
  if (seatIds.length > 0) {
    await releaseSeats(seatIds);
  }
  return seatIds;
}
