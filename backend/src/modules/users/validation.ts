import { z } from 'zod';
import { eventCategoryValues } from '../events/validation';

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng YYYY-MM-DD').optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  new_password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
});

export const savePreferencesSchema = z.object({
  categories:     z.array(z.enum(eventCategoryValues)).min(1).max(eventCategoryValues.length),
  preferred_city: z.string().max(100).optional(),
});

export const updateAvatarSchema = z.object({
  data_url: z.string().min(1, 'Thiếu dữ liệu ảnh đại diện'),
});

export type UpdateProfileInput    = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput   = z.infer<typeof changePasswordSchema>;
export type SavePreferencesInput  = z.infer<typeof savePreferencesSchema>;
export type UpdateAvatarInput      = z.infer<typeof updateAvatarSchema>;
