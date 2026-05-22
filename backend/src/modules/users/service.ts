import bcrypt from 'bcryptjs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import prisma from '../../config/prisma';
import { config } from '../../config/env';
import { AppError } from '../../shared/AppError';
import type { UpdateProfileInput, ChangePasswordInput, UpdateAvatarInput } from './validation';

const profileSelect = {
  id: true,
  email: true,
  full_name: true,
  phone: true,
  gender: true,
  birth_date: true,
  role: true,
  avatar_url: true,
  category_preferences: true,
  preferred_city: true,
  password_hash: true,
  created_at: true,
} as const;

export async function getProfile(userId: number) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: profileSelect,
  });
  if (!user) {
    throw AppError.notFound('Người dùng không tồn tại');
  }
  const { password_hash, ...rest } = user;
  return { ...rest, has_password: !!password_hash };
}

export async function updateProfile(userId: number, input: UpdateProfileInput) {
  if (Object.keys(input).length === 0) {
    throw AppError.badRequest('Không có dữ liệu cập nhật');
  }

  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      ...(input.full_name !== undefined && { full_name: input.full_name }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.gender !== undefined && { gender: input.gender }),
      ...(input.birth_date !== undefined && { birth_date: input.birth_date ? new Date(input.birth_date) : null }),
    },
    select: profileSelect,
  });
  const { password_hash, ...rest } = updated;
  return { ...rest, has_password: !!password_hash };
}

export async function changePassword(userId: number, input: ChangePasswordInput) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, password_hash: true },
  });
  if (!user) {
    throw AppError.notFound('Người dùng không tồn tại');
  }

  const valid = await bcrypt.compare(input.current_password, user.password_hash);
  if (!valid) {
    throw AppError.unauthorized('Sai mật khẩu hiện tại', 'WRONG_PASSWORD');
  }

  const newHash = await bcrypt.hash(input.new_password, 10);
  await prisma.users.update({ where: { id: userId }, data: { password_hash: newHash } });
}

export async function savePreferences(userId: number, input: { categories: string[]; preferred_city?: string }) {
  await prisma.users.update({
    where: { id: userId },
    data: {
      category_preferences: input.categories,
      preferred_city: input.preferred_city ?? null,
    },
  });
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

  await prisma.users.update({ where: { id: userId }, data: { avatar_url: avatarUrl } });

  return getProfile(userId);
}
