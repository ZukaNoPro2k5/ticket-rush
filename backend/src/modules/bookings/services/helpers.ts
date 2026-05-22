import { Prisma } from '@prisma/client';
import { AppError } from '../../../shared/AppError';
import type { SeatPriceRow } from './types';

type Tx = Prisma.TransactionClient;

export async function applyPromoCode(
  tx: Tx,
  code: string | undefined,
  eventId: number,
  subtotal: number,
): Promise<{ promoCodeId: number | null; discountAmount: number }> {
  if (!code) return { promoCodeId: null, discountAmount: 0 };

  const promos = await tx.$queryRaw<Array<{
    id: number;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: Prisma.Decimal;
    max_uses: number | null;
    used_count: number;
    event_id: number | null;
    min_amount: Prisma.Decimal;
  }>>`
    SELECT id, code, discount_type, discount_value, max_uses, used_count, event_id, min_amount
    FROM promo_codes
    WHERE code = ${code} AND is_active = TRUE
      AND starts_at <= NOW() AND expires_at >= NOW()
    FOR UPDATE
  `;
  if (promos.length === 0) throw AppError.badRequest('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'INVALID_PROMO');
  const promo = promos[0];
  if (promo.event_id && promo.event_id !== eventId) {
    throw AppError.badRequest('Mã giảm giá không áp dụng cho sự kiện này', 'INVALID_PROMO');
  }
  if (promo.max_uses && promo.used_count >= promo.max_uses) {
    throw AppError.badRequest('Mã giảm giá đã hết lượt sử dụng', 'MAX_USES_REACHED');
  }
  const minAmount = Number(promo.min_amount);
  if (subtotal < minAmount) {
    throw AppError.badRequest(`Đơn tối thiểu ${minAmount.toLocaleString('vi-VN')}đ để áp mã này`, 'MIN_AMOUNT_NOT_MET');
  }
  const discountValue = Number(promo.discount_value);
  const raw = promo.discount_type === 'percent'
    ? Math.round((subtotal * discountValue) / 100)
    : discountValue;
  const discountAmount = Math.min(raw, subtotal);
  await tx.promo_codes.update({ where: { id: promo.id }, data: { used_count: { increment: 1 } } });
  return { promoCodeId: promo.id, discountAmount };
}

export async function lockAndValidateSeats(tx: Tx, seatIds: number[], eventId: number): Promise<SeatPriceRow[]> {
  const seatRows = await tx.$queryRaw<SeatPriceRow[]>`
    SELECT s.id, s.zone_id, sz.price
    FROM seats s
    JOIN seat_zones sz ON sz.id = s.zone_id
    WHERE s.id IN (${Prisma.join(seatIds)}) AND sz.event_id = ${eventId}
    FOR UPDATE
  `;
  if (seatRows.length !== seatIds.length) throw AppError.badRequest('Một số ghế không thuộc sự kiện này');
  const unavailable = await tx.seats.findMany({
    where: { id: { in: seatIds }, status: { not: 'available' } },
    select: { id: true },
  });
  if (unavailable.length > 0) {
    throw AppError.conflict(`${unavailable.length} ghế đã bị người khác giữ hoặc đã bán`, 'SEATS_UNAVAILABLE');
  }
  return seatRows;
}

export async function updateSeatsStatus(
  tx: Tx,
  seatIds: number[],
  status: 'available' | 'locked' | 'sold',
  lockedBy: number | null = null,
): Promise<void> {
  if (seatIds.length === 0) return;
  await tx.seats.updateMany({
    where: { id: { in: seatIds } },
    data: status === 'locked'
      ? { status, locked_by: lockedBy, locked_at: new Date() }
      : { status, locked_by: null, locked_at: null },
  });
}
