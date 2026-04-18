import { z } from 'zod';

export const createPromoSchema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase()),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.number().positive(),
  max_uses: z.number().int().positive().nullable().optional().default(null),
  event_id: z.number().int().positive().nullable().optional().default(null),
  min_amount: z.number().min(0).optional().default(0),
  starts_at: z.string().datetime(),
  expires_at: z.string().datetime(),
});

export const updatePromoSchema = z.object({
  code: z.string().min(1).max(50).transform((v) => v.toUpperCase()).optional(),
  discount_type: z.enum(['percent', 'fixed']).optional(),
  discount_value: z.number().positive().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  event_id: z.number().int().positive().nullable().optional(),
  min_amount: z.number().min(0).optional(),
  starts_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  is_active: z.boolean().optional(),
});

export const validatePromoSchema = z.object({
  code: z.string().min(1).max(50),
  event_id: z.number().int().positive(),
  amount: z.number().positive(),
});

export type CreatePromoInput = z.infer<typeof createPromoSchema>;
export type UpdatePromoInput = z.infer<typeof updatePromoSchema>;
export type ValidatePromoInput = z.infer<typeof validatePromoSchema>;
