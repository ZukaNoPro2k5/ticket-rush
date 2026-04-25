import type { PoolConnection } from 'mysql2/promise';
import { AppError } from '../../../shared/AppError';
import type { PromoRow, SeatPriceRow } from './types';

/**
 * Validate a promo code against the current event + subtotal and return
 * `{ promoCodeId, discountAmount }`. Also increments the promo's `used_count`.
 * Returns `null`-like defaults when `code` is falsy.
 */
export async function applyPromoCode(
  conn: PoolConnection,
  code: string | undefined,
  eventId: number,
  subtotal: number,
): Promise<{ promoCodeId: number | null; discountAmount: number }> {
  if (!code) return { promoCodeId: null, discountAmount: 0 };

  const [promos] = await conn.execute<PromoRow[]>(
    `SELECT id, code, discount_type, discount_value, max_uses, used_count,
            event_id, min_amount, starts_at, expires_at, is_active
     FROM promo_codes
     WHERE code = ? AND is_active = TRUE
     AND starts_at <= NOW() AND expires_at >= NOW()`,
    [code],
  );

  if (promos.length === 0) {
    throw AppError.badRequest('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'INVALID_PROMO');
  }

  const promo = promos[0];

  if (promo.event_id && promo.event_id !== eventId) {
    throw AppError.badRequest('Mã giảm giá không áp dụng cho sự kiện này', 'INVALID_PROMO');
  }
  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    throw AppError.badRequest('Mã giảm giá đã hết lượt sử dụng', 'MAX_USES_REACHED');
  }
  if (subtotal < Number(promo.min_amount)) {
    throw AppError.badRequest(
      `Đơn tối thiểu ${Number(promo.min_amount).toLocaleString('vi-VN')}đ để áp mã này`,
      'MIN_AMOUNT_NOT_MET',
    );
  }

  const raw = promo.discount_type === 'percent'
    ? Math.round((subtotal * Number(promo.discount_value)) / 100)
    : Number(promo.discount_value);
  const discountAmount = Math.min(raw, subtotal);

  await conn.execute('UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?', [promo.id]);

  return { promoCodeId: promo.id, discountAmount };
}

/**
 * Lock the given seats and assert they belong to the event and are available.
 * Returns the seat rows (with zone + price) in input order.
 */
export async function lockAndValidateSeats(
  conn: PoolConnection,
  seatIds: number[],
  eventId: number,
): Promise<SeatPriceRow[]> {
  const placeholders = seatIds.map(() => '?').join(', ');

  const [seatRows] = await conn.execute<SeatPriceRow[]>(
    `SELECT s.id, s.zone_id, sz.price
     FROM seats s
     JOIN seat_zones sz ON sz.id = s.zone_id
     WHERE s.id IN (${placeholders}) AND sz.event_id = ?
     FOR UPDATE`,
    [...seatIds, eventId],
  );

  if (seatRows.length !== seatIds.length) {
    throw AppError.badRequest('Một số ghế không thuộc sự kiện này');
  }

  const [statusRows] = await conn.execute<
    (import('mysql2').RowDataPacket & { status: string })[]
  >(
    `SELECT id, status FROM seats WHERE id IN (${placeholders})`,
    seatIds,
  );
  const unavailable = statusRows.filter((r) => r.status !== 'available');
  if (unavailable.length > 0) {
    throw AppError.conflict(
      `${unavailable.length} ghế đã bị người khác giữ hoặc đã bán`,
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
