import type { ResultSetHeader } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { AppError } from '../../../shared/AppError';
import type { BookableEventRow, PromoRow, SeatPriceRow } from './types';

export async function assertEventCanAcceptBooking(
  conn: PoolConnection,
  eventId: number,
): Promise<{ queueEnabled: boolean }> {
  const [rows] = await conn.execute<BookableEventRow[]>(
    'SELECT id, status, queue_enabled FROM events WHERE id = ? FOR UPDATE',
    [eventId],
  );

  if (rows.length === 0) {
    throw AppError.notFound('Su kien khong ton tai', 'EVENT_NOT_FOUND');
  }
  if (rows[0].status !== 'published') {
    throw AppError.conflict('Su kien chua mo ban hoac da ket thuc', 'EVENT_NOT_BOOKABLE');
  }

  return { queueEnabled: Boolean(rows[0].queue_enabled) };
}

export function assertUniqueSeatIds(seatIds: number[]) {
  if (new Set(seatIds).size !== seatIds.length) {
    throw AppError.badRequest('Danh sach ghe bi trung', 'VALIDATION_ERROR');
  }
}

/**
 * Validate a promo code against the current event + subtotal and return
 * `{ promoCodeId, discountAmount }`. This runs inside the booking transaction
 * and locks the promo row to keep max_uses accurate under concurrency.
 */
export async function applyPromoCode(
  conn: PoolConnection,
  code: string | undefined,
  eventId: number,
  subtotal: number,
): Promise<{ promoCodeId: number | null; discountAmount: number }> {
  const normalizedCode = code?.trim().toUpperCase();
  if (!normalizedCode) return { promoCodeId: null, discountAmount: 0 };

  const [promos] = await conn.execute<PromoRow[]>(
    `SELECT id, code, discount_type, discount_value, max_uses, used_count,
            event_id, min_amount, starts_at, expires_at, is_active
     FROM promo_codes
     WHERE code = ?
     FOR UPDATE`,
    [normalizedCode],
  );

  if (promos.length === 0) {
    throw AppError.badRequest('Ma giam gia khong hop le', 'INVALID_PROMO');
  }

  const promo = promos[0];
  const now = Date.now();

  if (!Boolean(promo.is_active)) {
    throw AppError.badRequest('Ma giam gia khong con hoat dong', 'INVALID_PROMO');
  }
  if (new Date(promo.starts_at).getTime() > now) {
    throw AppError.badRequest('Ma giam gia chua co hieu luc', 'INVALID_PROMO');
  }
  if (new Date(promo.expires_at).getTime() < now) {
    throw AppError.badRequest('Ma giam gia da het han', 'PROMO_EXPIRED');
  }
  if (promo.event_id !== null && promo.event_id !== eventId) {
    throw AppError.badRequest('Ma giam gia khong ap dung cho su kien nay', 'INVALID_PROMO');
  }
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    throw AppError.badRequest('Ma giam gia da het luot su dung', 'MAX_USES_REACHED');
  }
  if (subtotal < Number(promo.min_amount)) {
    throw AppError.badRequest('Don hang chua dat gia tri toi thieu de ap ma nay', 'MIN_AMOUNT_NOT_MET');
  }

  const raw = promo.discount_type === 'percent'
    ? Math.round((subtotal * Number(promo.discount_value)) / 100)
    : Number(promo.discount_value);
  const discountAmount = Math.min(raw, subtotal);

  const [update] = await conn.execute<ResultSetHeader>(
    `UPDATE promo_codes
     SET used_count = used_count + 1
     WHERE id = ? AND (max_uses IS NULL OR used_count < max_uses)`,
    [promo.id],
  );
  if (update.affectedRows !== 1) {
    throw AppError.badRequest('Ma giam gia da het luot su dung', 'MAX_USES_REACHED');
  }

  return { promoCodeId: promo.id, discountAmount };
}

/**
 * Lock the given seats and assert they belong to the event and are available.
 * Returns the seat rows (with zone + price).
 */
export async function lockAndValidateSeats(
  conn: PoolConnection,
  seatIds: number[],
  eventId: number,
): Promise<SeatPriceRow[]> {
  const placeholders = seatIds.map(() => '?').join(', ');

  const [seatRows] = await conn.execute<SeatPriceRow[]>(
    `SELECT s.id, s.zone_id, sz.price, s.status
     FROM seats s
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE s.id IN (${placeholders}) AND sz.event_id = ?
     FOR UPDATE`,
    [...seatIds, eventId],
  );

  if (seatRows.length !== seatIds.length) {
    throw AppError.badRequest('Mot so ghe khong thuoc su kien nay', 'INVALID_SEATS');
  }

  const unavailable = seatRows.filter((r) => r.status !== 'available');
  if (unavailable.length > 0) {
    throw AppError.conflict(
      `${unavailable.length} ghe da bi nguoi khac giu hoac da ban`,
      'SEATS_UNAVAILABLE',
    );
  }

  return seatRows;
}

/**
 * Bulk update seat status for a list of seat ids using a single statement.
 */
export async function updateSeatsStatus(
  conn: PoolConnection,
  seatIds: number[],
  status: 'available' | 'locked' | 'sold',
  lockedBy: number | null = null,
): Promise<void> {
  if (seatIds.length === 0) return;
  const ph = seatIds.map(() => '?').join(', ');

  if (status === 'locked') {
    await conn.execute(
      `UPDATE seats SET status = 'locked', locked_by = ?, locked_at = NOW()
       WHERE id IN (${ph})`,
      [lockedBy, ...seatIds],
    );
    return;
  }

  await conn.execute(
    `UPDATE seats SET status = ?, locked_by = NULL, locked_at = NULL
     WHERE id IN (${ph})`,
    [status, ...seatIds],
  );
}
