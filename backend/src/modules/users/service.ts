import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import type { UpdateProfileInput, ChangePasswordInput } from './validation';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  gender: string | null;
  birth_date: string | null;
  role: string;
  created_at: string;
}

export async function getProfile(userId: number) {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name, phone, gender, birth_date, role, created_at FROM users WHERE id = ?',
    [userId],
  );
  if (rows.length === 0) {
    throw AppError.notFound('Người dùng không tồn tại');
  }
  return rows[0];
}

export async function updateProfile(userId: number, input: UpdateProfileInput) {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];

  if (input.full_name !== undefined) { fields.push('full_name = ?'); values.push(input.full_name); }
  if (input.phone !== undefined) { fields.push('phone = ?'); values.push(input.phone); }
  if (input.gender !== undefined) { fields.push('gender = ?'); values.push(input.gender); }
  if (input.birth_date !== undefined) { fields.push('birth_date = ?'); values.push(input.birth_date); }

  if (fields.length === 0) {
    throw AppError.badRequest('Không có dữ liệu cập nhật');
  }

  values.push(userId);
  await pool.execute<ResultSetHeader>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name, phone, gender, birth_date, role, created_at FROM users WHERE id = ?',
    [userId],
  );

  return rows[0];
}

export async function changePassword(userId: number, input: ChangePasswordInput) {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, password_hash FROM users WHERE id = ?',
    [userId],
  );

  if (rows.length === 0) {
    throw AppError.notFound('Người dùng không tồn tại');
  }

  const valid = await bcrypt.compare(input.current_password, rows[0].password_hash);
  if (!valid) {
    throw AppError.unauthorized('Sai mật khẩu hiện tại', 'WRONG_PASSWORD');
  }

  const newHash = await bcrypt.hash(input.new_password, 10);
  await pool.execute<ResultSetHeader>(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [newHash, userId],
  );
}

export async function savePreferences(userId: number, input: { categories: string[]; preferred_city?: string }) {
  await pool.execute<ResultSetHeader>(
    'UPDATE users SET category_preferences = ?, preferred_city = ? WHERE id = ?',
    [JSON.stringify(input.categories), input.preferred_city ?? null, userId],
  );
}
