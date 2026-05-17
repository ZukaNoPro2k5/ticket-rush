import { z } from 'zod';

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ').max(255),
});

export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>;
