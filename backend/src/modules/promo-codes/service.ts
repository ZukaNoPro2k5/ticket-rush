import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import type { CreatePromoInput, UpdatePromoInput, ValidatePromoInput } from './validation';

interface PromoRow extends RowDataPacket {
  id: number;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  event_id: number | null;
  min_amount: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export async function listPromoCodes(eventId?: number) {
  const conditions: string[] = [];
  const params: (number | string)[] = [];

  if (eventId) {
    conditions.push('(event_id = ? OR event_id IS NULL)');
    params.push(eventId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.query<PromoRow[]>(
    `SELECT * FROM promo_codes ${where} ORDER BY created_at DESC`,
    params,
  );
  return rows;
}

export async function getPromoById(id: number) {
  const [rows] = await pool.execute<PromoRow[]>(
    'SELECT * FROM promo_codes WHERE id = ?',
    [id],
  );
  if (rows.length === 0) throw AppError.notFound('Mã giảm giá không tồn tại', 'PROMO_NOT_FOUND');
  return rows[0];
}

export async function createPromo(input: CreatePromoInput) {
  const { code, discount_type, discount_value, max_uses, event_id, min_amount, starts_at, expires_at } = input;

  const [existing] = await pool.execute<PromoRow[]>(
    'SELECT id FROM promo_codes WHERE code = ?',
    [code],
  );
  if (existing.length > 0) throw AppError.badRequest('Mã này đã tồn tại', 'PROMO_CODE_EXISTS');

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, event_id, min_amount, starts_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, discount_type, discount_value, max_uses ?? null, event_id ?? null, min_amount ?? 0, starts_at, expires_at],
  );

  return getPromoById(result.insertId);
}

export async function updatePromo(id: number, input: UpdatePromoInput) {
  await getPromoById(id);

  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  if (input.code !== undefined)           { fields.push('code = ?');           values.push(input.code); }
  if (input.discount_type !== undefined)  { fields.push('discount_type = ?');  values.push(input.discount_type); }
  if (input.discount_value !== undefined) { fields.push('discount_value = ?'); values.push(input.discount_value); }
  if (input.max_uses !== undefined)       { fields.push('max_uses = ?');       values.push(input.max_uses ?? null); }
  if (input.event_id !== undefined)       { fields.push('event_id = ?');       values.push(input.event_id ?? null); }
  if (input.min_amount !== undefined)     { fields.push('min_amount = ?');     values.push(input.min_amount); }
  if (input.starts_at !== undefined)      { fields.push('starts_at = ?');      values.push(input.starts_at); }
  if (input.expires_at !== undefined)     { fields.push('expires_at = ?');     values.push(input.expires_at); }
  if (input.is_active !== undefined)      { fields.push('is_active = ?');      values.push(input.is_active); }

  if (fields.length === 0) throw AppError.badRequest('Không có dữ liệu cập nhật');

  values.push(id);
  await pool.execute(`UPDATE promo_codes SET ${fields.join(', ')} WHERE id = ?`, values);

  return getPromoById(id);
}

export async function deletePromo(id: number) {
  await getPromoById(id);
  await pool.execute('DELETE FROM promo_codes WHERE id = ?', [id]);
}

export async function validatePromo(input: ValidatePromoInput) {
  const now = new Date();
  const code = input.code.toUpperCase();

  const [rows] = await pool.execute<PromoRow[]>(
    `SELECT * FROM promo_codes
     WHERE code = ?
       AND is_active = TRUE
       AND starts_at <= NOW()
       AND expires_at >= NOW()`,
    [code],
  );

  if (rows.length === 0) {
    throw AppError.badRequest('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'INVALID_PROMO');
  }

  const promo = rows[0];

  if (promo.event_id !== null && promo.event_id !== input.event_id) {
    throw AppError.badRequest('Mã giảm giá không áp dụng cho sự kiện này', 'PROMO_EVENT_MISMATCH');
  }

  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    throw AppError.badRequest('Mã giảm giá đã hết lượt sử dụng', 'PROMO_MAX_USES');
  }

  if (input.amount < promo.min_amount) {
    throw AppError.badRequest(
      `Đơn hàng tối thiểu ${promo.min_amount.toLocaleString('vi-VN')}đ để dùng mã này`,
      'PROMO_MIN_AMOUNT',
    );
  }

  const discount = promo.discount_type === 'percent'
    ? Math.round(input.amount * (promo.discount_value / 100))
    : Math.min(promo.discount_value, input.amount);

  void now;
  return {
    promo_code_id: promo.id,
    code: promo.code,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    discount_amount: discount,
  };
}
