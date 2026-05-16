<<<<<<< Updated upstream
// TODO: Dev 3 — Promo codes service
=======
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
  if (rows.length === 0) throw AppError.notFound('Ma giam gia khong ton tai', 'PROMO_NOT_FOUND');
  return rows[0];
}

export async function createPromo(input: CreatePromoInput) {
  const code = input.code.trim().toUpperCase();

  const [existing] = await pool.execute<PromoRow[]>(
    'SELECT id FROM promo_codes WHERE code = ?',
    [code],
  );
  if (existing.length > 0) throw AppError.conflict('Ma giam gia da ton tai', 'CODE_ALREADY_EXISTS');

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, event_id, min_amount, starts_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      code,
      input.discount_type,
      input.discount_value,
      input.max_uses ?? null,
      input.event_id ?? null,
      input.min_amount ?? 0,
      input.starts_at,
      input.expires_at,
    ],
  );

  return getPromoById(result.insertId);
}

export async function updatePromo(id: number, input: UpdatePromoInput) {
  await getPromoById(id);

  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  if (input.code !== undefined) {
    const code = input.code.trim().toUpperCase();
    const [existing] = await pool.execute<PromoRow[]>(
      'SELECT id FROM promo_codes WHERE code = ? AND id <> ?',
      [code, id],
    );
    if (existing.length > 0) throw AppError.conflict('Ma giam gia da ton tai', 'CODE_ALREADY_EXISTS');
    fields.push('code = ?');
    values.push(code);
  }
  if (input.discount_type !== undefined) { fields.push('discount_type = ?'); values.push(input.discount_type); }
  if (input.discount_value !== undefined) { fields.push('discount_value = ?'); values.push(input.discount_value); }
  if (input.max_uses !== undefined) { fields.push('max_uses = ?'); values.push(input.max_uses ?? null); }
  if (input.event_id !== undefined) { fields.push('event_id = ?'); values.push(input.event_id ?? null); }
  if (input.min_amount !== undefined) { fields.push('min_amount = ?'); values.push(input.min_amount); }
  if (input.starts_at !== undefined) { fields.push('starts_at = ?'); values.push(input.starts_at); }
  if (input.expires_at !== undefined) { fields.push('expires_at = ?'); values.push(input.expires_at); }
  if (input.is_active !== undefined) { fields.push('is_active = ?'); values.push(input.is_active); }

  if (fields.length === 0) throw AppError.badRequest('Khong co du lieu cap nhat');

  values.push(id);
  await pool.execute(`UPDATE promo_codes SET ${fields.join(', ')} WHERE id = ?`, values);

  return getPromoById(id);
}

export async function deletePromo(id: number) {
  await getPromoById(id);
  await pool.execute('DELETE FROM promo_codes WHERE id = ?', [id]);
}

export async function validatePromo(input: ValidatePromoInput) {
  const code = input.code.trim().toUpperCase();

  const [rows] = await pool.execute<PromoRow[]>(
    'SELECT * FROM promo_codes WHERE code = ?',
    [code],
  );

  if (rows.length === 0) {
    throw AppError.badRequest('Ma giam gia khong hop le', 'INVALID_PROMO');
  }

  const promo = rows[0];
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
  if (promo.event_id !== null && promo.event_id !== input.event_id) {
    throw AppError.badRequest('Ma giam gia khong ap dung cho su kien nay', 'INVALID_PROMO');
  }
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    throw AppError.badRequest('Ma giam gia da het luot su dung', 'MAX_USES_REACHED');
  }
  if (input.amount < Number(promo.min_amount)) {
    throw AppError.badRequest('Don hang chua dat gia tri toi thieu de dung ma nay', 'MIN_AMOUNT_NOT_MET');
  }

  const discount = promo.discount_type === 'percent'
    ? Math.round(input.amount * (Number(promo.discount_value) / 100))
    : Math.min(Number(promo.discount_value), input.amount);

  return {
    promo_code_id: promo.id,
    code: promo.code,
    discount_type: promo.discount_type,
    discount_value: Number(promo.discount_value),
    discount_amount: discount,
    final_amount: input.amount - discount,
  };
}
>>>>>>> Stashed changes
