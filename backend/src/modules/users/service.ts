import bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import pool from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../shared/AppError';
import type { UpdateProfileInput, ChangePasswordInput, UpdateAvatarInput } from './validation';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  gender: string | null;
  birth_date: string | null;
  role: string;
  avatar_url: string | null;
  category_preferences: string[] | string | null;
  preferred_city: string | null;
  created_at: string;
}

export async function getProfile(userId: number) {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name, phone, gender, birth_date, role, avatar_url, category_preferences, preferred_city, password_hash, created_at FROM users WHERE id = ? LIMIT 1',
    [userId],
  );
  if (rows.length === 0) {
    throw AppError.notFound('Người dùng không tồn tại');
  }
  const { password_hash, ...rest } = rows[0];
  return { ...rest, has_password: !!password_hash };
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
    'SELECT id, email, full_name, phone, gender, birth_date, role, avatar_url, category_preferences, preferred_city, password_hash, created_at FROM users WHERE id = ? LIMIT 1',
    [userId],
  );

  const { password_hash, ...rest } = rows[0];
  return { ...rest, has_password: !!password_hash };
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

function parseAvatarDataUrl(dataUrl: string) {
  const match = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) {
    throw AppError.badRequest('Ảnh đại diện phải là PNG, JPG hoặc WEBP', 'INVALID_AVATAR');
  }
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength === 0 || buffer.byteLength > 1_500_000) {
    throw AppError.badRequest('Ảnh đại diện tối đa 1.5MB', 'AVATAR_TOO_LARGE');
  }
  return { ext, buffer };
}

export async function updateAvatar(userId: number, input: UpdateAvatarInput) {
  const { ext, buffer } = parseAvatarDataUrl(input.data_url);
  const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
  await mkdir(avatarDir, { recursive: true });
  const fileName = `user-${userId}-${Date.now()}.${ext}`;
  await writeFile(path.join(avatarDir, fileName), buffer);
  const avatarUrl = `${config.publicUrl}/uploads/avatars/${fileName}`;

  await pool.execute<ResultSetHeader>(
    'UPDATE users SET avatar_url = ? WHERE id = ?',
    [avatarUrl, userId],
  );

  return getProfile(userId);
}
