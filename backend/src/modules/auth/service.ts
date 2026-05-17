import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../shared/AppError';
import { sendTemplatedEmail } from '../email/service';
import type {
  RegisterInput,
  LoginInput,
  OAuthSyncInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './validation';

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  gender: 'male' | 'female' | 'other' | null;
  birth_date: string | null;
  role: 'customer' | 'admin';
  avatar_url: string | null;
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
    'SELECT id, email, full_name, phone, gender, birth_date, role, avatar_url, created_at FROM users WHERE id = ?',
    [result.insertId],
  );

  const user = rows[0];
  const token = signToken({ userId: user.id, role: user.role });
  await sendTemplatedEmail('account_welcome', user.email, { user_name: user.full_name });

  return { token, user };
}

export async function login(input: LoginInput) {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, password_hash, full_name, phone, gender, birth_date, role, avatar_url, created_at FROM users WHERE email = ? LIMIT 1',
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
    'SELECT id, email, full_name, phone, gender, birth_date, role, avatar_url, created_at FROM users WHERE id = ? LIMIT 1',
    [userId],
  );

  if (rows.length === 0) {
    throw AppError.notFound('Người dùng không tồn tại');
  }

  return rows[0];
}

export async function oauthSync(input: OAuthSyncInput) {
  const { provider, providerAccountId, email, name, avatar } = input;

  // Try to find by oauth provider first, then fall back to email
  const [byOAuth] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name, phone, gender, birth_date, role, avatar_url, created_at FROM users WHERE oauth_provider = ? AND oauth_provider_id = ? LIMIT 1',
    [provider, providerAccountId],
  );

  if (byOAuth.length > 0) {
    const user = byOAuth[0];
    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: sanitizeUser(user), isNewUser: false };
  }

  // Check if an account with this email already exists (link oauth)
  const [byEmail] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name, phone, gender, birth_date, role, avatar_url, created_at FROM users WHERE email = ? LIMIT 1',
    [email],
  );

  if (byEmail.length > 0) {
    const user = byEmail[0];
    // Link oauth provider to existing account; update avatar if not set yet
    await pool.execute(
      'UPDATE users SET oauth_provider = ?, oauth_provider_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?',
      [provider, providerAccountId, avatar ?? null, user.id],
    );
    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: sanitizeUser(user), isNewUser: false };
  }

  // Create new user (no password_hash for OAuth accounts)
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash, full_name, avatar_url, oauth_provider, oauth_provider_id)
     VALUES (?, '', ?, ?, ?, ?)`,
    [email, name ?? email.split('@')[0], avatar ?? null, provider, providerAccountId],
  );

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name, phone, gender, birth_date, role, avatar_url, created_at FROM users WHERE id = ?',
    [result.insertId],
  );

  const newUser = rows[0];
  const token = signToken({ userId: newUser.id, role: newUser.role });
  return { token, user: sanitizeUser(newUser), isNewUser: true };
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, email, full_name FROM users WHERE email = ? LIMIT 1',
    [input.email],
  );
  const user = rows[0];
  if (!user) return;

  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await pool.execute<ResultSetHeader>(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [user.id, tokenHash, expiresAt],
  );

  await sendTemplatedEmail('password_reset', user.email, {
    user_name: user.full_name,
    reset_link: `${config.frontendUrl}/reset-password?token=${token}`,
  });
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);
  const [rows] = await pool.execute<(RowDataPacket & {
    id: number;
    user_id: number;
    expires_at: string;
    used_at: string | null;
  })[]>(
    `SELECT id, user_id, expires_at, used_at
     FROM password_reset_tokens
     WHERE token_hash = ?
     LIMIT 1`,
    [tokenHash],
  );
  const row = rows[0];
  if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
    throw AppError.badRequest('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 'RESET_TOKEN_INVALID');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute<ResultSetHeader>(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, row.user_id],
    );
    await conn.execute<ResultSetHeader>(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?',
      [row.id],
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
