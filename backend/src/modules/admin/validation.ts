import { z } from 'zod';

export const updateSystemSettingsSchema = z.object({
  company_name: z.string().trim().min(1).max(120),
  support_email: z.string().trim().email().max(255),
  address: z.string().trim().min(1).max(255),
  ticket_hold_minutes: z.number().int().min(1).max(120),
  max_tickets_per_booking: z.number().int().min(1).max(50),
  timezone: z.string().trim().min(1).max(80),
  language: z.enum(['vi', 'en']),
  maintenance_mode: z.boolean(),
});

export const updatePaymentSandboxSchema = z.object({
  payment_sandbox_mode: z.boolean(),
});

export const updatePaymentGatewaySchema = z.object({
  enabled: z.boolean(),
  partner_code: z.string().trim().max(255).nullable(),
  access_key: z.string().trim().max(255).nullable(),
  secret_key: z.string().trim().max(255).nullable().optional(),
});

export const updateSmtpSettingsSchema = z.object({
  host: z.string().trim().min(1).max(255),
  port: z.number().int().min(1).max(65535),
  from_name: z.string().trim().min(1).max(255),
  from_email: z.string().trim().email().max(255),
  username: z.string().trim().min(1).max(255),
  password: z.string().max(255).nullable().optional(),
  encryption: z.enum(['tls', 'ssl', 'none']),
});

export const updateEmailTemplateSchema = z.object({
  subject: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1),
  status: z.enum(['active', 'inactive']),
});

export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
export type UpdatePaymentSandboxInput = z.infer<typeof updatePaymentSandboxSchema>;
export type UpdatePaymentGatewayInput = z.infer<typeof updatePaymentGatewaySchema>;
export type UpdateSmtpSettingsInput = z.infer<typeof updateSmtpSettingsSchema>;
export type UpdateEmailTemplateInput = z.infer<typeof updateEmailTemplateSchema>;
