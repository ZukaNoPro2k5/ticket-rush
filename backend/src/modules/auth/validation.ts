import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  full_name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  phone: z.string().regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh phải theo định dạng YYYY-MM-DD')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const oauthSyncSchema = z.object({
  provider:          z.enum(['google', 'facebook']),
  providerAccountId: z.string().min(1),
  email:             z.string().email(),
  name:              z.string().min(1).max(100).optional(),
  avatar:            z.string().url().max(500).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Thiếu mã đặt lại mật khẩu'),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
});

export type RegisterInput  = z.infer<typeof registerSchema>;
export type LoginInput     = z.infer<typeof loginSchema>;
export type OAuthSyncInput = z.infer<typeof oauthSyncSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
