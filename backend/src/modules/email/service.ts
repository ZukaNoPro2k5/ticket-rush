import { createTransport } from 'nodemailer';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../config/database';

type TemplateId = 'booking_confirmation' | 'booking_reminder' | 'account_welcome' | 'password_reset';
type TemplateValues = Record<string, string | number | null | undefined>;

interface TemplateRow extends RowDataPacket {
  id: TemplateId;
  subject: string;
  body: string;
  status: 'active' | 'inactive';
}

interface SmtpRow extends RowDataPacket {
  host: string;
  port: number;
  from_name: string;
  from_email: string;
  username: string;
  password: string | null;
  encryption: 'tls' | 'ssl' | 'none';
}

function render(text: string, values: TemplateValues) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ''));
}

async function getTemplate(id: TemplateId) {
  const [rows] = await pool.execute<TemplateRow[]>(
    'SELECT id, subject, body, status FROM email_templates WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

async function getSmtp() {
  const [rows] = await pool.execute<SmtpRow[]>(
    'SELECT host, port, from_name, from_email, username, password, encryption FROM smtp_settings WHERE id = 1 LIMIT 1',
  );
  return rows[0] ?? null;
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
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO email_outbox (template_id, recipient, subject, body, status)
     VALUES (?, ?, ?, ?, 'queued')`,
    [templateId, recipient, subject, body],
  );
  const outboxId = result.insertId;

  if (!smtp?.password) {
    await pool.execute(
      `UPDATE email_outbox
       SET status = 'skipped', error_message = ?
       WHERE id = ?`,
      ['SMTP chưa có mật khẩu; email đã ghi vào outbox nhưng chưa gửi.', outboxId],
    );
    return { outboxId, status: 'skipped' as const };
  }

  try {
    const transport = createTransport({
      host: smtp.host,
      port: Number(smtp.port),
      secure: smtp.encryption === 'ssl',
      auth: smtp.username ? { user: smtp.username, pass: smtp.password } : undefined,
      requireTLS: smtp.encryption === 'tls',
    });
    await transport.sendMail({
      from: `"${smtp.from_name}" <${smtp.from_email}>`,
      to: recipient,
      subject,
      text: body,
    });
    await pool.execute(
      `UPDATE email_outbox
       SET status = 'sent', sent_at = NOW(), error_message = NULL
       WHERE id = ?`,
      [outboxId],
    );
    return { outboxId, status: 'sent' as const };
  } catch (err) {
    const message = err instanceof Error ? err.message.slice(0, 500) : 'Không gửi được email';
    await pool.execute(
      `UPDATE email_outbox
       SET status = 'failed', error_message = ?
       WHERE id = ?`,
      [message, outboxId],
    );
    return { outboxId, status: 'failed' as const };
  }
}
