import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import prisma from '../../config/prisma';
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

function signToken(payload: { userId: number; role: string }): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

function sanitizeUser(user: any) {
  const { password_hash, ...safe } = user;
  return safe;
}

export async function register(input: RegisterInput) {
  const existing = await prisma.users.findFirst({
    where: { email: input.email },
    select: { id: true }
  });

  if (existing) {
    throw AppError.conflict('Email đã được đăng ký', 'EMAIL_TAKEN');
  }

  const password_hash = await bcrypt.hash(input.password, 10);

  const newUser = await prisma.users.create({
    data: {
      email: input.email,
      password_hash,
      full_name: input.full_name,
      phone: input.phone ?? null,
      gender: input.gender ?? null,
      birth_date: input.birth_date ? new Date(input.birth_date) : null,
    }
  });

  const token = signToken({ userId: newUser.id, role: newUser.role });
  await sendTemplatedEmail('account_welcome', newUser.email, { user_name: newUser.full_name });

  return { token, user: sanitizeUser(newUser) };
}

export async function login(input: LoginInput) {
  const user = await prisma.users.findFirst({
    where: { email: input.email }
  });

  if (!user) {
    throw AppError.unauthorized('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);

  if (!valid) {
    throw AppError.unauthorized('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
  }

  const token = signToken({ userId: user.id, role: user.role });

  return { token, user: sanitizeUser(user) };
}

export async function getProfile(userId: number) {
  const user = await prisma.users.findFirst({
    where: { id: userId }
  });

  if (!user) {
    throw AppError.notFound('Người dùng không tồn tại');
  }

  return sanitizeUser(user);
}

export async function oauthSync(input: OAuthSyncInput) {
  const { provider, providerAccountId, email, name, avatar } = input;

  const byOAuth = await prisma.users.findFirst({
    where: { oauth_provider: provider, oauth_provider_id: providerAccountId }
  });

  if (byOAuth) {
    const token = signToken({ userId: byOAuth.id, role: byOAuth.role });
    return { token, user: sanitizeUser(byOAuth), isNewUser: false };
  }

  const byEmail = await prisma.users.findFirst({
    where: { email }
  });

  if (byEmail) {
    const updatedUser = await prisma.users.update({
      where: { id: byEmail.id },
      data: {
        oauth_provider: provider,
        oauth_provider_id: providerAccountId,
        avatar_url: avatar ?? byEmail.avatar_url,
      }
    });
    
    const token = signToken({ userId: updatedUser.id, role: updatedUser.role });
    return { token, user: sanitizeUser(updatedUser), isNewUser: false };
  }

  const newUser = await prisma.users.create({
    data: {
      email,
      password_hash: '',
      full_name: name ?? email.split('@')[0],
      avatar_url: avatar ?? null,
      oauth_provider: provider,
      oauth_provider_id: providerAccountId
    }
  });

  const token = signToken({ userId: newUser.id, role: newUser.role });
  return { token, user: sanitizeUser(newUser), isNewUser: true };
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const user = await prisma.users.findFirst({
    where: { email: input.email },
    select: { id: true, email: true, full_name: true }
  });
  if (!user) return;

  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.password_reset_tokens.create({
    data: {
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt
    }
  });

  await sendTemplatedEmail('password_reset', user.email, {
    user_name: user.full_name,
    reset_link: `${config.frontendUrl}/reset-password?token=${token}`,
  });
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);
  
  const tokenRecord = await prisma.password_reset_tokens.findFirst({
    where: { token_hash: tokenHash }
  });

  if (!tokenRecord || tokenRecord.used_at || tokenRecord.expires_at < new Date()) {
    throw AppError.badRequest('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 'RESET_TOKEN_INVALID');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  
  await prisma.$transaction([
    prisma.users.update({
      where: { id: tokenRecord.user_id },
      data: { password_hash: passwordHash }
    }),
    prisma.password_reset_tokens.update({
      where: { id: tokenRecord.id },
      data: { used_at: new Date() }
    })
  ]);
}
