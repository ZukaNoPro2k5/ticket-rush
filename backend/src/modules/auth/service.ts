import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../shared/AppError';
import type { RegisterInput, LoginInput } from './validation';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  gender: 'male' | 'female' | 'other' | null;
  birth_date: string | null;
  role: 'customer' | 'admin';
  created_at: string;
}

function signToken(payload: { userId: number; role: string }): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

function sanitizeUser(user: UserRow) {
  const { password_hash: _, ...safe } = user;
  return safe;
}

export async function register(input: RegisterInput) {
  const [existing] = await pool.execute<UserRow[]>(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [input.email],
  );

  if (existing.length > 0) {
    throw AppError.conflict('Email đã được đăng ký', 'EMAIL_TAKEN');
  }

  const password_hash = await bcrypt.hash(input.password, 10);

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash, full_name, phone, gender, birth_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.email,
      password_hash,
      input.full_name,
      input.phone ?? null,
      input.gender ?? null,
      input.birth_date ?? null,
    ],
  );

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name, phone, gender, birth_date, role, created_at FROM users WHERE id = ?',
    [result.insertId],
  );

  const user = rows[0];
  const token = signToken({ userId: user.id, role: user.role });

  return { token, user };
}

export async function login(input: LoginInput) {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, password_hash, full_name, phone, gender, birth_date, role, created_at FROM users WHERE email = ? LIMIT 1',
    [input.email],
  );

  if (rows.length === 0) {
    throw AppError.unauthorized('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
  }

  const user = rows[0];
  const valid = await bcrypt.compare(input.password, user.password_hash);

  if (!valid) {
    throw AppError.unauthorized('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
  }

  const token = signToken({ userId: user.id, role: user.role });

  return { token, user: sanitizeUser(user) };
}

export async function getProfile(userId: number) {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name, phone, gender, birth_date, role, created_at FROM users WHERE id = ? LIMIT 1',
    [userId],
  );

  if (rows.length === 0) {
    throw AppError.notFound('Người dùng không tồn tại');
  }

  return rows[0];
}
