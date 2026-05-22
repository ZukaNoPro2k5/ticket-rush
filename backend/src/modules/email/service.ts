import { createTransport } from 'nodemailer';
import prisma from '../../config/prisma';

type TemplateId = 'booking_confirmation' | 'booking_reminder' | 'account_welcome' | 'password_reset';
type TemplateValues = Record<string, string | number | null | undefined>;

function render(text: string, values: TemplateValues) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ''));
}

async function getTemplate(id: TemplateId) {
  return prisma.email_templates.findUnique({
    where: { id },
    select: { id: true, subject: true, body: true, status: true },
  });
}

async function getSmtp() {
  return prisma.smtp_settings.findUnique({
    where: { id: 1 },
    select: { host: true, port: true, from_name: true, from_email: true, username: true, password: true, encryption: true },
  });
}

export async function sendTemplatedEmail(
  templateId: TemplateId,
  recipient: string,
  values: TemplateValues,
) {
  const [template, smtp] = await Promise.all([getTemplate(templateId), getSmtp()]);
  if (!template || template.status !== 'active') return null;

  const subject = render(template.subject, values);
  const body = render(template.body, values);
  const outbox = await prisma.email_outbox.create({
    data: { template_id: templateId, recipient, subject, body, status: 'queued' },
  });
  const outboxId = outbox.id;

  const user = process.env.SMTP_USER || smtp?.username;
  const pass = process.env.SMTP_PASS || smtp?.password;
  const isGmail = !!process.env.SMTP_PASS;

  if (!pass) {
    await prisma.email_outbox.update({
      where: { id: outboxId },
      data: { status: 'skipped', error_message: 'SMTP chưa có mật khẩu; email đã ghi vào outbox nhưng chưa gửi.' },
    });
    return { outboxId, status: 'skipped' as const };
  }

  try {
    const transport = createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: { user, pass },
          }
        : {
            host: smtp?.host,
            port: Number(smtp?.port),
            secure: smtp?.encryption === 'ssl',
            auth: user ? { user, pass } : undefined,
            requireTLS: smtp?.encryption === 'tls',
          }
    );
    await transport.sendMail({
      from: `"${smtp?.from_name || 'TicketRush'}" <${user}>`,
      to: recipient,
      subject,
      text: body,
    });
    await prisma.email_outbox.update({
      where: { id: outboxId },
      data: { status: 'sent', sent_at: new Date(), error_message: null },
    });
    return { outboxId, status: 'sent' as const };
  } catch (err) {
    const message = err instanceof Error ? err.message.slice(0, 500) : 'Không gửi được email';
    await prisma.email_outbox.update({ where: { id: outboxId }, data: { status: 'failed', error_message: message } });
    return { outboxId, status: 'failed' as const };
  }
}
