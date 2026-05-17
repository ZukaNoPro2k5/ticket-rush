import { z } from 'zod';

export const createBookingSchema = z.object({
  event_id: z.number().int().positive(),
  // Runtime ceiling is loaded from admin_system_settings in createBooking().
  // Validation keeps an absolute guard here to reject pathological payloads early.
  seat_ids: z.array(z.number().int().positive()).min(1, 'Chọn ít nhất 1 ghế').max(50, 'Tối đa 50 ghế/lần'),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const applyBookingPromoSchema = z.object({
  code: z.string().trim().min(1, 'Nhập mã giảm giá').max(50).transform((value) => value.toUpperCase()),
});

export type ApplyBookingPromoInput = z.infer<typeof applyBookingPromoSchema>;

export const replaceBookingSeatsSchema = z.object({
  // Runtime ceiling is loaded from admin_system_settings in replaceBookingSeats().
  seat_ids: z.array(z.number().int().positive()).min(1, 'Chọn ít nhất 1 ghế').max(50, 'Tối đa 50 ghế/lần'),
});

export type ReplaceBookingSeatsInput = z.infer<typeof replaceBookingSeatsSchema>;

export const confirmBookingSchema = z.object({
  payment_method: z.string().trim().min(1, 'Chọn phương thức thanh toán').max(40),
});

export type ConfirmBookingInput = z.infer<typeof confirmBookingSchema>;
