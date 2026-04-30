import { z } from 'zod';

export const createSeatZoneSchema = z.object({
  name: z.string().trim().min(1).max(50),
  price: z.coerce.number().int().positive('Price must be greater than 0'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  total_rows: z.coerce.number().int().min(1).max(26, 'Maximum 26 rows (A-Z)'),
  total_cols: z.coerce.number().int().min(1).max(100),
});

export const updateSeatZoneSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  price: z.coerce.number().int().positive().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
});

export type CreateSeatZoneInput = z.infer<typeof createSeatZoneSchema>;
export type UpdateSeatZoneInput = z.infer<typeof updateSeatZoneSchema>;
