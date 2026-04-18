import { z } from 'zod';

export const createSeatZoneSchema = z.object({
  name: z.string().min(1).max(50),
  price: z.number().int().positive('Giá phải lớn hơn 0'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu hex không hợp lệ'),
  total_rows: z.number().int().min(1).max(26, 'Tối đa 26 hàng (A-Z)'),
  total_cols: z.number().int().min(1).max(100),
});

export const updateSeatZoneSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  price: z.number().int().positive().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type CreateSeatZoneInput = z.infer<typeof createSeatZoneSchema>;
export type UpdateSeatZoneInput = z.infer<typeof updateSeatZoneSchema>;
