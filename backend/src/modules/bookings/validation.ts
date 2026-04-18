import { z } from 'zod';

export const createBookingSchema = z.object({
  event_id: z.number().int().positive(),
  seat_ids: z.array(z.number().int().positive()).min(1, 'Chọn ít nhất 1 ghế').max(10, 'Tối đa 10 ghế/lần'),
  promo_code: z.string().max(50).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
