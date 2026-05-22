import prisma from '../../../config/prisma';
import { AppError } from '../../../shared/AppError';
import { invalidateRuntimeSystemSettingsCache } from '../../../config/runtimeSettings';
import type {
  UpdateEmailTemplateInput,
  UpdatePaymentGatewayInput,
  UpdateSmtpSettingsInput,
  UpdateSystemSettingsInput,
} from '../validation';

function mapSystemSettings(row: Awaited<ReturnType<typeof prisma.admin_system_settings.findUniqueOrThrow>>) {
  return {
    company_name: row.company_name,
    support_email: row.support_email,
    address: row.address,
    ticket_hold_minutes: row.ticket_hold_minutes,
    max_tickets_per_booking: row.max_tickets_per_booking,
    timezone: row.timezone,
    language: row.language,
    maintenance_mode: row.maintenance_mode,
    payment_sandbox_mode: row.payment_sandbox_mode,
    updated_at: row.updated_at,
  };
}

export async function getSystemSettings() {
  const row = await prisma.admin_system_settings.findUnique({ where: { id: 1 } });
  if (!row) throw AppError.notFound('Chưa có cấu hình hệ thống', 'ADMIN_SETTINGS_NOT_FOUND');
  return mapSystemSettings(row);
}

export async function updateSystemSettings(input: UpdateSystemSettingsInput) {
  await getSystemSettings();
  const updated = await prisma.admin_system_settings.update({
    where: { id: 1 },
    data: input,
  });
  invalidateRuntimeSystemSettingsCache();
  return mapSystemSettings(updated);
}

export async function updatePaymentSandboxMode(paymentSandboxMode: boolean) {
  await getSystemSettings();
  const updated = await prisma.admin_system_settings.update({
    where: { id: 1 },
    data: { payment_sandbox_mode: paymentSandboxMode },
  });
  return mapSystemSettings(updated);
}

function mapPaymentGateway(row: Awaited<ReturnType<typeof prisma.payment_gateways.findFirstOrThrow>>) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    enabled: row.enabled,
    partner_code: row.partner_code,
    access_key: row.access_key,
    secret_key_set: Boolean(row.secret_key),
    webhook_url: row.webhook_url,
    updated_at: row.updated_at,
  };
}

export async function listPaymentGateways() {
  const rows = await prisma.payment_gateways.findMany({ orderBy: { name: 'asc' } });
  const priority = new Map([['vnpay', 0], ['momo', 1], ['stripe', 2]]);
  return rows
    .sort((a, b) => (priority.get(a.id) ?? 99) - (priority.get(b.id) ?? 99) || a.name.localeCompare(b.name))
    .map(mapPaymentGateway);
}

export async function updatePaymentGateway(id: string, input: UpdatePaymentGatewayInput) {
  const current = await prisma.payment_gateways.findUnique({ where: { id } });
  if (!current) throw AppError.notFound('Cổng thanh toán không tồn tại', 'PAYMENT_GATEWAY_NOT_FOUND');
  const updated = await prisma.payment_gateways.update({
    where: { id },
    data: {
      enabled: input.enabled,
      partner_code: input.partner_code,
      access_key: input.access_key,
      secret_key: input.secret_key === undefined ? current.secret_key : input.secret_key,
    },
  });
  return mapPaymentGateway(updated);
}

function mapSmtpSettings(row: Awaited<ReturnType<typeof prisma.smtp_settings.findUniqueOrThrow>>) {
  return {
    host: row.host,
    port: row.port,
    from_name: row.from_name,
    from_email: row.from_email,
    username: row.username,
    password_set: Boolean(row.password),
    encryption: row.encryption,
    updated_at: row.updated_at,
  };
}

export async function getMailSettings() {
  const [smtp, templates] = await prisma.$transaction([
    prisma.smtp_settings.findUnique({ where: { id: 1 } }),
    prisma.email_templates.findMany({ orderBy: { name: 'asc' } }),
  ]);
  if (!smtp) throw AppError.notFound('Chưa có cấu hình SMTP', 'SMTP_SETTINGS_NOT_FOUND');
  return { smtp: mapSmtpSettings(smtp), templates };
}

export async function updateSmtpSettings(input: UpdateSmtpSettingsInput) {
  await getMailSettings();
  const updated = await prisma.smtp_settings.update({
    where: { id: 1 },
    data: {
      host: input.host,
      port: input.port,
      from_name: input.from_name,
      from_email: input.from_email,
      username: input.username,
      ...(input.password !== undefined && { password: input.password }),
      encryption: input.encryption,
    },
  });
  return mapSmtpSettings(updated);
}

export async function updateEmailTemplate(id: string, input: UpdateEmailTemplateInput) {
  const current = await prisma.email_templates.findUnique({ where: { id } });
  if (!current) throw AppError.notFound('Mẫu email không tồn tại', 'EMAIL_TEMPLATE_NOT_FOUND');
  return prisma.email_templates.update({ where: { id }, data: input });
}
