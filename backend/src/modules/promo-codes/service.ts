import prisma from '../../config/prisma';
import { AppError } from '../../shared/AppError';
import type { CreatePromoInput, UpdatePromoInput, ValidatePromoInput } from './validation';

function serializePromo<T extends {
  discount_value: { toNumber(): number };
  min_amount: { toNumber(): number };
}>(promo: T) {
  return {
    ...promo,
    discount_value: promo.discount_value.toNumber(),
    min_amount: promo.min_amount.toNumber(),
  };
}

export async function listPromoCodes(eventId?: number) {
  const rows = await prisma.promo_codes.findMany({
    where: eventId ? { OR: [{ event_id: eventId }, { event_id: null }] } : undefined,
    orderBy: { created_at: 'desc' },
  });
  return rows.map(serializePromo);
}

export async function listPublicPromoCodes() {
  const now = new Date();
  const rows = await prisma.promo_codes.findMany({
    where: {
      is_active: true,
      starts_at: { lte: now },
      expires_at: { gte: now },
      OR: [{ max_uses: null }, { max_uses: { gt: prisma.promo_codes.fields.used_count } }],
      AND: [{ OR: [{ event_id: null }, { events: { status: 'published' } }] }],
    },
    include: { events: { select: { title: true, category: true } } },
    orderBy: [{ expires_at: 'asc' }, { created_at: 'desc' }],
  });
  return rows.map((row) => ({
    ...serializePromo(row),
    event_title: row.events?.title ?? null,
    event_category: row.events?.category ?? null,
  }));
}

export async function getPromoById(id: number) {
  const promo = await prisma.promo_codes.findUnique({ where: { id } });
  if (!promo) throw AppError.notFound('Mã giảm giá không tồn tại', 'PROMO_NOT_FOUND');
  return serializePromo(promo);
}

export async function createPromo(input: CreatePromoInput) {
  const existing = await prisma.promo_codes.findUnique({ where: { code: input.code }, select: { id: true } });
  if (existing) throw AppError.badRequest('Mã này đã tồn tại', 'PROMO_CODE_EXISTS');

  const created = await prisma.promo_codes.create({
    data: {
      code: input.code,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      max_uses: input.max_uses ?? null,
      event_id: input.event_id ?? null,
      min_amount: input.min_amount ?? 0,
      starts_at: new Date(input.starts_at),
      expires_at: new Date(input.expires_at),
    },
  });
  return serializePromo(created);
}

export async function updatePromo(id: number, input: UpdatePromoInput) {
  await getPromoById(id);
  if (Object.keys(input).length === 0) throw AppError.badRequest('Không có dữ liệu cập nhật');

  const updated = await prisma.promo_codes.update({
    where: { id },
    data: {
      ...(input.code !== undefined && { code: input.code }),
      ...(input.discount_type !== undefined && { discount_type: input.discount_type }),
      ...(input.discount_value !== undefined && { discount_value: input.discount_value }),
      ...(input.max_uses !== undefined && { max_uses: input.max_uses ?? null }),
      ...(input.event_id !== undefined && { event_id: input.event_id ?? null }),
      ...(input.min_amount !== undefined && { min_amount: input.min_amount }),
      ...(input.starts_at !== undefined && { starts_at: new Date(input.starts_at) }),
      ...(input.expires_at !== undefined && { expires_at: new Date(input.expires_at) }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    },
  });
  return serializePromo(updated);
}

export async function deletePromo(id: number) {
  await getPromoById(id);
  await prisma.promo_codes.delete({ where: { id } });
}

export async function validatePromo(input: ValidatePromoInput) {
  const now = new Date();
  const promo = await prisma.promo_codes.findFirst({
    where: {
      code: input.code.toUpperCase(),
      is_active: true,
      starts_at: { lte: now },
      expires_at: { gte: now },
    },
  });

  if (!promo) throw AppError.badRequest('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'INVALID_PROMO');
  if (promo.event_id !== null && promo.event_id !== input.event_id) {
    throw AppError.badRequest('Mã giảm giá không áp dụng cho sự kiện này', 'PROMO_EVENT_MISMATCH');
  }
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    throw AppError.badRequest('Mã giảm giá đã hết lượt sử dụng', 'PROMO_MAX_USES');
  }

  const minAmount = promo.min_amount.toNumber();
  const discountValue = promo.discount_value.toNumber();
  if (input.amount < minAmount) {
    throw AppError.badRequest(
      `Đơn hàng tối thiểu ${minAmount.toLocaleString('vi-VN')}đ để dùng mã này`,
      'PROMO_MIN_AMOUNT',
    );
  }
  const discount = promo.discount_type === 'percent'
    ? Math.round(input.amount * (discountValue / 100))
    : Math.min(discountValue, input.amount);

  return {
    promo_code_id: promo.id,
    code: promo.code,
    discount_type: promo.discount_type,
    discount_value: discountValue,
    discount_amount: discount,
  };
}
