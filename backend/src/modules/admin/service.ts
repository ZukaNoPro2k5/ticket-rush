import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { AppError } from '../../shared/AppError';
import { invalidateRuntimeSystemSettingsCache } from '../../config/runtimeSettings';
import type {
  UpdateEmailTemplateInput,
  UpdatePaymentGatewayInput,
  UpdateSmtpSettingsInput,
  UpdateSystemSettingsInput,
} from './validation';

interface SystemSettingsRow extends RowDataPacket {
  id: number;
  company_name: string;
  support_email: string;
  address: string;
  ticket_hold_minutes: number;
  max_tickets_per_booking: number;
  timezone: string;
  language: 'vi' | 'en';
  maintenance_mode: number | boolean;
  payment_sandbox_mode: number | boolean;
  updated_at: string;
}

interface PaymentGatewayRow extends RowDataPacket {
  id: string;
  name: string;
  description: string;
  enabled: number | boolean;
  partner_code: string | null;
  access_key: string | null;
  secret_key: string | null;
  webhook_url: string;
  updated_at: string;
}

interface SmtpSettingsRow extends RowDataPacket {
  id: number;
  host: string;
  port: number;
  from_name: string;
  from_email: string;
  username: string;
  password: string | null;
  encryption: 'tls' | 'ssl' | 'none';
  updated_at: string;
}

interface EmailTemplateRow extends RowDataPacket {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'active' | 'inactive';
  updated_at: string;
}

export async function getDashboardStats() {
  const [[revenue]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(DISTINCT b.id) AS total_bookings,
       SUM(b.total_amount)  AS total_revenue,
       COUNT(DISTINCT b.user_id) AS total_customers
     FROM bookings b
     WHERE b.status = 'confirmed'`,
  );

  const [[events]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'published') AS published,
       SUM(status = 'completed') AS completed
     FROM events`,
  );

  const [[tickets]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM tickets`,
  );

  return {
    revenue: Number(revenue.total_revenue ?? 0),
    total_bookings: Number(revenue.total_bookings),
    total_customers: Number(revenue.total_customers),
    events: {
      total: Number(events.total),
      published: Number(events.published),
      completed: Number(events.completed),
    },
    total_tickets: Number(tickets.total),
  };
}

export async function getRevenueByMonth(year: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       MONTH(b.confirmed_at) AS month,
       SUM(b.total_amount)   AS revenue,
       COUNT(*)              AS bookings
     FROM bookings b
     WHERE b.status = 'confirmed'
       AND YEAR(b.confirmed_at) = ?
     GROUP BY MONTH(b.confirmed_at)
     ORDER BY month`,
    [year],
  );
  return rows.map((r) => ({
    month: Number(r.month),
    revenue: Number(r.revenue),
    bookings: Number(r.bookings),
  }));
}

export async function getRevenueByDay(year: number, month: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       DAY(b.confirmed_at)   AS day,
       SUM(b.total_amount)   AS revenue,
       COUNT(*)              AS bookings
     FROM bookings b
     WHERE b.status = 'confirmed'
       AND YEAR(b.confirmed_at) = ?
       AND MONTH(b.confirmed_at) = ?
     GROUP BY DAY(b.confirmed_at)
     ORDER BY day`,
    [year, month],
  );
  return rows.map((r) => ({
    day: Number(r.day),
    revenue: Number(r.revenue),
    bookings: Number(r.bookings),
  }));
}

export async function getFillRates() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       e.id, e.title, e.event_date, e.status, e.poster_url,
       COUNT(s.id)                                                   AS total_seats,
       SUM(CASE WHEN s.status = 'sold' THEN 1 ELSE 0 END)           AS sold_seats,
       ROUND(SUM(CASE WHEN s.status = 'sold' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(s.id), 0), 1) AS fill_rate
     FROM events e
     LEFT JOIN seat_zones sz ON sz.event_id = e.id
     LEFT JOIN seats s ON s.zone_id = sz.id
     WHERE e.status IN ('published', 'completed')
     GROUP BY e.id
     ORDER BY e.event_date DESC
     LIMIT 20`,
  );
  return rows.map((r) => ({
    id: Number(r.id),
    title: r.title as string,
    event_date: r.event_date as string,
    status: r.status as string,
    poster_url: (r.poster_url as string | null) ?? null,
    total_seats: Number(r.total_seats),
    sold_seats: Number(r.sold_seats),
    fill_rate: Number(r.fill_rate ?? 0),
  }));
}

export async function getCategoryStats() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       e.category,
       COUNT(DISTINCT b.id)  AS bookings,
       SUM(b.total_amount)   AS revenue,
       COUNT(DISTINCT e.id)  AS event_count
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     WHERE b.status = 'confirmed'
     GROUP BY e.category
     ORDER BY revenue DESC`,
  );
  return rows.map((r) => ({
    category:    r.category as string,
    bookings:    Number(r.bookings),
    revenue:     Number(r.revenue ?? 0),
    event_count: Number(r.event_count),
  }));
}

export async function getAudienceStats() {
  const [gender] = await pool.query<RowDataPacket[]>(
    `SELECT u.gender, COUNT(*) AS count
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     WHERE b.status = 'confirmed'
     GROUP BY u.gender`,
  );

  const [age] = await pool.query<RowDataPacket[]>(
    `SELECT
       CASE
         WHEN TIMESTAMPDIFF(YEAR, u.birth_date, CURDATE()) < 18 THEN 'Under 18'
         WHEN TIMESTAMPDIFF(YEAR, u.birth_date, CURDATE()) BETWEEN 18 AND 24 THEN '18-24'
         WHEN TIMESTAMPDIFF(YEAR, u.birth_date, CURDATE()) BETWEEN 25 AND 34 THEN '25-34'
         WHEN TIMESTAMPDIFF(YEAR, u.birth_date, CURDATE()) BETWEEN 35 AND 44 THEN '35-44'
         ELSE '45+'
       END AS age_group,
       COUNT(*) AS count
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     WHERE b.status = 'confirmed' AND u.birth_date IS NOT NULL
     GROUP BY age_group
     ORDER BY MIN(TIMESTAMPDIFF(YEAR, u.birth_date, CURDATE()))`,
  );

  return { gender, age };
}

export async function getComparisonStats() {
  const [[row]] = await pool.query<RowDataPacket[]>(
    `SELECT
       SUM(CASE WHEN MONTH(confirmed_at) = MONTH(CURDATE())
                 AND YEAR(confirmed_at)  = YEAR(CURDATE())
           THEN total_amount ELSE 0 END)                                         AS cur_month_rev,
       SUM(CASE WHEN MONTH(confirmed_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                 AND YEAR(confirmed_at)  = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
           THEN total_amount ELSE 0 END)                                         AS prev_month_rev,
       COUNT(CASE WHEN MONTH(confirmed_at) = MONTH(CURDATE())
                   AND YEAR(confirmed_at)  = YEAR(CURDATE())
             THEN 1 END)                                                          AS cur_month_bookings,
       COUNT(CASE WHEN MONTH(confirmed_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                   AND YEAR(confirmed_at)  = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
             THEN 1 END)                                                          AS prev_month_bookings,
       SUM(CASE WHEN YEAR(confirmed_at)  = YEAR(CURDATE())
           THEN total_amount ELSE 0 END)                                         AS ytd_rev,
       SUM(CASE WHEN YEAR(confirmed_at)  = YEAR(CURDATE()) - 1
                 AND MONTH(confirmed_at) <= MONTH(CURDATE())
           THEN total_amount ELSE 0 END)                                         AS prev_ytd_rev,
       SUM(CASE WHEN QUARTER(confirmed_at) = QUARTER(CURDATE())
                 AND YEAR(confirmed_at)    = YEAR(CURDATE())
           THEN total_amount ELSE 0 END)                                         AS cur_quarter_rev,
       SUM(CASE WHEN QUARTER(confirmed_at) = QUARTER(DATE_SUB(CURDATE(), INTERVAL 1 QUARTER))
                 AND YEAR(confirmed_at)    = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 QUARTER))
           THEN total_amount ELSE 0 END)                                         AS prev_quarter_rev,
       COUNT(CASE WHEN QUARTER(confirmed_at) = QUARTER(CURDATE())
                   AND YEAR(confirmed_at)    = YEAR(CURDATE())
             THEN 1 END)                                                          AS cur_quarter_bookings,
       COUNT(CASE WHEN QUARTER(confirmed_at) = QUARTER(DATE_SUB(CURDATE(), INTERVAL 1 QUARTER))
                   AND YEAR(confirmed_at)    = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 QUARTER))
             THEN 1 END)                                                          AS prev_quarter_bookings,
       AVG(total_amount)                                                          AS avg_order
     FROM bookings
     WHERE status = 'confirmed'`,
  );

  const pct = (cur: number, prev: number) =>
    prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null;

  const curMonthRev      = Number(row.cur_month_rev      ?? 0);
  const prevMonthRev     = Number(row.prev_month_rev     ?? 0);
  const curMonthBook     = Number(row.cur_month_bookings ?? 0);
  const prevMonthBook    = Number(row.prev_month_bookings ?? 0);
  const ytdRev           = Number(row.ytd_rev            ?? 0);
  const prevYtdRev       = Number(row.prev_ytd_rev       ?? 0);
  const curQuarterRev    = Number(row.cur_quarter_rev      ?? 0);
  const prevQuarterRev   = Number(row.prev_quarter_rev     ?? 0);
  const curQuarterBook   = Number(row.cur_quarter_bookings ?? 0);
  const prevQuarterBook  = Number(row.prev_quarter_bookings ?? 0);

  return {
    cur_month_revenue:         curMonthRev,
    prev_month_revenue:        prevMonthRev,
    revenue_change_pct:        pct(curMonthRev, prevMonthRev),
    cur_month_bookings:        curMonthBook,
    prev_month_bookings:       prevMonthBook,
    bookings_change_pct:       pct(curMonthBook, prevMonthBook),
    ytd_revenue:               ytdRev,
    prev_ytd_revenue:          prevYtdRev,
    ytd_change_pct:            pct(ytdRev, prevYtdRev),
    cur_quarter_revenue:         curQuarterRev,
    prev_quarter_revenue:         prevQuarterRev,
    quarter_change_pct:           pct(curQuarterRev, prevQuarterRev),
    cur_quarter_bookings:         curQuarterBook,
    prev_quarter_bookings:        prevQuarterBook,
    quarter_bookings_change_pct:  pct(curQuarterBook, prevQuarterBook),
    avg_order_value:              Number(row.avg_order ?? 0),
  };
}

export async function getTopEvents(limit = 5) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       e.id, e.title, e.event_date, e.venue, e.status, e.poster_url,
       COALESCE(SUM(b.total_amount), 0)                                           AS revenue,
       COUNT(DISTINCT b.id)                                                        AS bookings,
       ROUND(
         SUM(CASE WHEN s.status = 'sold' THEN 1 ELSE 0 END) * 100.0
         / NULLIF(COUNT(s.id), 0), 1
       )                                                                           AS fill_rate
     FROM events e
     LEFT JOIN bookings    b  ON b.event_id  = e.id AND b.status = 'confirmed'
     LEFT JOIN seat_zones  sz ON sz.event_id = e.id
     LEFT JOIN seats       s  ON s.zone_id   = sz.id
     GROUP BY e.id
     ORDER BY revenue DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id:         Number(r.id),
    title:      r.title      as string,
    event_date: r.event_date as string,
    venue:      r.venue      as string,
    status:     r.status     as string,
    poster_url: (r.poster_url as string | null) ?? null,
    revenue:    Number(r.revenue),
    bookings:   Number(r.bookings),
    fill_rate:  Number(r.fill_rate ?? 0),
  }));
}

export async function listAdminEvents(params: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { status, category, search, page = 1, limit: pageSize = 20 } = params;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const bindings: (string | number)[] = [];

  if (status && status !== 'all') {
    conditions.push('e.status = ?');
    bindings.push(status);
  }
  if (category && category !== 'all') {
    conditions.push('e.category = ?');
    bindings.push(category);
  }
  if (search && search.trim()) {
    conditions.push('(e.title LIKE ? OR e.venue LIKE ?)');
    bindings.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [[{ total }]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM events e ${where}`,
    bindings,
  );

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       e.id, e.title, e.description, e.category, e.venue, e.event_date,
       e.poster_url, e.status, e.created_at,
       MIN(sz.price)  AS min_price,
       MAX(sz.price)  AS max_price,
       COALESCE(seat_stats.total_seats, 0)      AS total_seats,
       COALESCE(seat_stats.available_seats, 0)  AS available_seats,
       COALESCE(seat_stats.sold_seats, 0)       AS sold_seats,
       COALESCE(bk.revenue, 0)                  AS revenue
     FROM events e
     LEFT JOIN seat_zones sz ON sz.event_id = e.id
     LEFT JOIN (
       SELECT sz2.event_id,
              COUNT(s.id)                                           AS total_seats,
              SUM(CASE WHEN s.status = 'available' THEN 1 ELSE 0 END) AS available_seats,
              SUM(CASE WHEN s.status = 'sold' THEN 1 ELSE 0 END)      AS sold_seats
       FROM seat_zones sz2
       LEFT JOIN seats s ON s.zone_id = sz2.id
       GROUP BY sz2.event_id
     ) seat_stats ON seat_stats.event_id = e.id
     LEFT JOIN (
       SELECT b.event_id, SUM(b.total_amount) AS revenue
       FROM bookings b
       WHERE b.status = 'confirmed'
       GROUP BY b.event_id
     ) bk ON bk.event_id = e.id
     ${where}
     GROUP BY e.id
     ORDER BY e.created_at DESC
     LIMIT ? OFFSET ?`,
    [...bindings, pageSize, offset],
  );

  const events = rows.map((r) => ({
    id:              Number(r.id),
    title:           r.title as string,
    description:     (r.description as string | null) ?? null,
    category:        r.category as string,
    venue:           r.venue as string,
    event_date:      r.event_date as string,
    poster_url:      (r.poster_url as string | null) ?? null,
    status:          r.status as string,
    created_at:      r.created_at as string,
    min_price:       r.min_price === null ? null : Number(r.min_price),
    max_price:       r.max_price === null ? null : Number(r.max_price),
    total_seats:     Number(r.total_seats),
    available_seats: Number(r.available_seats),
    sold_seats:      Number(r.sold_seats),
    revenue:         Number(r.revenue),
  }));

  return {
    events,
    pagination: {
      page,
      limit: pageSize,
      total: Number((total as unknown as number) ?? 0),
      total_pages: Math.ceil(Number((total as unknown as number) ?? 0) / pageSize),
    },
  };
}

export async function getRecentBookings(limit = 8) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       b.id,
       u.full_name  AS user_name,
       e.title      AS event_title,
       b.total_amount,
       b.confirmed_at,
       COUNT(t.id)  AS ticket_count
     FROM bookings b
     JOIN  users  u ON u.id = b.user_id
     JOIN  events e ON e.id = b.event_id
     LEFT JOIN tickets t ON t.booking_id = b.id
     WHERE b.status = 'confirmed'
     GROUP BY b.id
     ORDER BY b.confirmed_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    id:            Number(r.id),
    user_name:     r.user_name     as string,
    event_title:   r.event_title   as string,
    total_amount:  Number(r.total_amount),
    confirmed_at:  r.confirmed_at  as string,
    ticket_count:  Number(r.ticket_count),
  }));
}

function formatMoneySvc(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr';
  return n.toLocaleString('vi-VN') + 'đ';
}

function buildRuleBasedSummary(data: {
  curMonthRev: number;
  prevMonthRev: number;
  revChangePct: number | null;
  ytdRev: number;
  ytdChangePct: number | null;
  avgOrder: number;
  topEventTitle: string | null;
  publishedEvents: number;
}): string {
  const now        = new Date();
  const monthName  = now.toLocaleDateString('vi-VN', { month: 'long' });
  const year       = now.getFullYear();
  const parts: string[] = [];

  if (data.revChangePct !== null) {
    const trend = data.revChangePct >= 0
      ? `tăng ${data.revChangePct}%`
      : `giảm ${Math.abs(data.revChangePct)}%`;
    parts.push(
      `Doanh thu ${monthName} ${trend} so với tháng trước, đạt ${formatMoneySvc(data.curMonthRev)}.`,
    );
  } else {
    parts.push(`Doanh thu ${monthName} đạt ${formatMoneySvc(data.curMonthRev)}.`);
  }

  if (data.ytdChangePct !== null) {
    const ytdTrend = data.ytdChangePct >= 0
      ? `tăng ${data.ytdChangePct}%`
      : `giảm ${Math.abs(data.ytdChangePct)}%`;
    parts.push(
      `Lũy kế ${year} đạt ${formatMoneySvc(data.ytdRev)}, ${ytdTrend} so với cùng kỳ năm ngoái.`,
    );
  } else if (data.ytdRev > 0) {
    parts.push(`Lũy kế ${year} đạt ${formatMoneySvc(data.ytdRev)}.`);
  }

  if (data.topEventTitle) {
    parts.push(`Sự kiện dẫn đầu doanh thu: "${data.topEventTitle}".`);
  }

  if (data.publishedEvents > 0) {
    parts.push(`Hiện có ${data.publishedEvents} sự kiện đang mở bán.`);
  }

  if (data.avgOrder > 0) {
    parts.push(`Giá trị đơn hàng trung bình ${formatMoneySvc(data.avgOrder)}.`);
  }

  return parts.join(' ');
}

export async function generateSummary(params: {
  curMonthRev: number;
  prevMonthRev: number;
  revChangePct: number | null;
  ytdRev: number;
  ytdChangePct: number | null;
  avgOrder: number;
  topEventTitle: string | null;
  publishedEvents: number;
}): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const now   = new Date();
      const month = now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
      const prompt = `Bạn là chuyên gia phân tích kinh doanh cho nền tảng bán vé sự kiện TicketRush (thị trường Việt Nam). Hãy viết MỘT đoạn văn ngắn (3-4 câu, tiếng Việt, thân thiện chuyên nghiệp) tóm tắt tình hình kinh doanh với dữ liệu sau:
- Tháng hiện tại: ${month}
- Doanh thu tháng này: ${formatMoneySvc(params.curMonthRev)} (${params.revChangePct !== null ? (params.revChangePct >= 0 ? '+' : '') + params.revChangePct + '% so với tháng trước' : 'chưa có so sánh'})
- Doanh thu lũy kế năm: ${formatMoneySvc(params.ytdRev)} (${params.ytdChangePct !== null ? (params.ytdChangePct >= 0 ? '+' : '') + params.ytdChangePct + '% so với cùng kỳ năm ngoái' : 'năm đầu tiên'})
- Sự kiện dẫn đầu: ${params.topEventTitle ?? 'chưa có'}
- Sự kiện đang mở bán: ${params.publishedEvents}
- Giá trị đơn trung bình: ${formatMoneySvc(params.avgOrder)}
Chỉ trả về đoạn văn, không giải thích, không tiêu đề.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
          }),
        },
      );
      if (res.ok) {
        const json = await res.json() as {
          candidates?: { content: { parts: { text: string }[] } }[];
        };
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch {
      // fallthrough to rule-based
    }
  }

  return buildRuleBasedSummary(params);
}

// ─────────────────────────────────────────────────────────────────────────
// Advanced business KPIs — operational metrics for the analytics page
// ─────────────────────────────────────────────────────────────────────────

export async function getAdvancedStats() {
  // 1. Cancellation rate (last 30 days)
  const [[cancelRow]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,
       COUNT(*)                                          AS total
     FROM bookings
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
  );

  // 2. Revenue per ticket (yield per seat sold)
  const [[yieldRow]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COALESCE(SUM(b.total_amount), 0) AS total_revenue,
       COALESCE(COUNT(t.id), 0)         AS total_tickets
     FROM bookings b
     LEFT JOIN tickets t ON t.booking_id = b.id
     WHERE b.status = 'confirmed'`,
  );

  // 3. Repeat customer rate
  const [[repeatRow]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(DISTINCT user_id)                                  AS total_customers,
       COUNT(DISTINCT CASE WHEN cnt > 1 THEN user_id END)       AS repeat_customers
     FROM (
       SELECT user_id, COUNT(*) AS cnt
       FROM bookings
       WHERE status = 'confirmed'
       GROUP BY user_id
     ) sub`,
  );

  // 4. Average lead time in days (how many days before the event tickets are bought)
  const [[leadRow]] = await pool.query<RowDataPacket[]>(
    `SELECT ROUND(AVG(DATEDIFF(e.event_date, b.confirmed_at)), 1) AS avg_lead_days
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     WHERE b.status = 'confirmed'
       AND b.confirmed_at < e.event_date`,
  );

  // 5. Promo code usage rate + discount impact
  const [[promoRow]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(CASE WHEN promo_code_id IS NOT NULL THEN 1 END) AS with_promo,
       COUNT(*)                                               AS total,
       COALESCE(SUM(CASE WHEN promo_code_id IS NOT NULL THEN discount_amount END), 0) AS total_discount,
       COALESCE(SUM(total_amount + discount_amount), 0)      AS gross_revenue
     FROM bookings
     WHERE status = 'confirmed'`,
  );

  // 6. Booking velocity — bookings per day this month
  const [[velocityRow]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(*)                       AS bookings_this_month,
       DAY(LAST_DAY(CURDATE()))       AS days_in_month,
       DAY(CURDATE())                 AS elapsed_days
     FROM bookings
     WHERE status = 'confirmed'
       AND MONTH(confirmed_at) = MONTH(CURDATE())
       AND YEAR(confirmed_at)  = YEAR(CURDATE())`,
  );

  const cancelled    = Number(cancelRow.cancelled   ?? 0);
  const totalBook    = Number(cancelRow.total        ?? 0);
  const totalRev     = Number(yieldRow.total_revenue ?? 0);
  const totalTix     = Number(yieldRow.total_tickets ?? 0);
  const totalCust    = Number(repeatRow.total_customers  ?? 0);
  const repeatCust   = Number(repeatRow.repeat_customers ?? 0);
  const withPromo    = Number(promoRow.with_promo    ?? 0);
  const totalConf    = Number(promoRow.total         ?? 0);
  const totalDisc    = Number(promoRow.total_discount ?? 0);
  const grossRev     = Number(promoRow.gross_revenue ?? 0);
  const bookMonth    = Number(velocityRow.bookings_this_month ?? 0);
  const daysElapsed  = Number(velocityRow.elapsed_days        ?? 1);

  return {
    cancellation_rate:    totalBook > 0  ? Math.round((cancelled  / totalBook)  * 1000) / 10 : 0,
    revenue_per_ticket:   totalTix  > 0  ? Math.round(totalRev    / totalTix)              : 0,
    repeat_customer_pct:  totalCust > 0  ? Math.round((repeatCust / totalCust)  * 1000) / 10 : 0,
    avg_lead_days:        Number(leadRow.avg_lead_days ?? 0),
    promo_usage_pct:      totalConf > 0  ? Math.round((withPromo  / totalConf)  * 1000) / 10 : 0,
    discount_impact_pct:  grossRev  > 0  ? Math.round((totalDisc  / grossRev)   * 1000) / 10 : 0,
    bookings_per_day:     daysElapsed > 0 ? Math.round((bookMonth / daysElapsed) * 10) / 10   : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Today Stats — today vs yesterday + 7-day daily revenue bars
// ─────────────────────────────────────────────────────────────────────────

export async function getTodayStats() {
  const [[today]] = await pool.query<RowDataPacket[]>(
    `SELECT
       COALESCE(SUM(CASE WHEN DATE(confirmed_at) = CURDATE() THEN total_amount END), 0)               AS revenue_today,
       COALESCE(SUM(CASE WHEN DATE(confirmed_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN total_amount END), 0) AS revenue_yesterday,
       COALESCE(COUNT(CASE WHEN DATE(confirmed_at) = CURDATE() THEN 1 END), 0)                        AS bookings_today,
       COALESCE(COUNT(CASE WHEN DATE(confirmed_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 1 END), 0) AS bookings_yesterday,
       COALESCE(SUM(CASE WHEN DATE(confirmed_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) THEN total_amount END), 0) AS revenue_7d
     FROM bookings
     WHERE status = 'confirmed'`,
  );

  const [weekRows] = await pool.query<RowDataPacket[]>(
    `SELECT
       DATE(confirmed_at)        AS day,
       SUM(total_amount)         AS revenue,
       COUNT(*)                  AS bookings
     FROM bookings
     WHERE status = 'confirmed'
       AND DATE(confirmed_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(confirmed_at)
     ORDER BY day ASC`,
  );

  const [catRows] = await pool.query<RowDataPacket[]>(
    `SELECT
       e.category,
       COUNT(DISTINCT b.id)      AS bookings,
       SUM(b.total_amount)       AS revenue
     FROM bookings b
     JOIN events e ON e.id = b.event_id
     WHERE b.status = 'confirmed'
       AND DATE(b.confirmed_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY e.category
     ORDER BY revenue DESC`,
  );

  const pct = (cur: number, prev: number) =>
    prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null;

  const revenueToday     = Number(today.revenue_today     ?? 0);
  const revenueYesterday = Number(today.revenue_yesterday ?? 0);
  const bookingsToday    = Number(today.bookings_today    ?? 0);
  const bookingsYesterday = Number(today.bookings_yesterday ?? 0);

  return {
    revenue_today:     revenueToday,
    revenue_yesterday: revenueYesterday,
    revenue_today_pct: pct(revenueToday, revenueYesterday),
    bookings_today:    bookingsToday,
    bookings_yesterday: bookingsYesterday,
    bookings_today_pct: pct(bookingsToday, bookingsYesterday),
    revenue_7d:        Number(today.revenue_7d ?? 0),
    weekly: weekRows.map((r) => ({
      day:      (r.day as Date).toISOString().slice(0, 10),
      revenue:  Number(r.revenue  ?? 0),
      bookings: Number(r.bookings ?? 0),
    })),
    weekly_category: catRows.map((r) => ({
      category: r.category as string,
      bookings: Number(r.bookings ?? 0),
      revenue:  Number(r.revenue  ?? 0),
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// AI Insights — rule-based recommendations for the admin Reports page
// ─────────────────────────────────────────────────────────────────────────

export interface Insight {
  id: string;
  severity: 'opportunity' | 'warning' | 'critical' | 'info';
  category: 'revenue' | 'events' | 'customers' | 'pricing' | 'operations';
  title: string;
  description: string;
  metric?: { value: string; label: string };
  action?: { label: string; href: string };
}

export async function generateInsights() {
  const insights: Insight[] = [];

  // ── 1. Revenue trend (this month vs last month) ──────────────────────────
  const [[rev]] = await pool.query<RowDataPacket[]>(
    `SELECT
       SUM(CASE WHEN YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())
                THEN total_amount ELSE 0 END) AS this_month,
       SUM(CASE WHEN created_at >= DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 1 MONTH)
                 AND created_at <  DATE_FORMAT(CURDATE(),'%Y-%m-01')
                THEN total_amount ELSE 0 END) AS last_month
     FROM bookings WHERE status='confirmed'`,
  );
  const thisM = Number(rev.this_month ?? 0);
  const lastM = Number(rev.last_month ?? 0);
  if (lastM > 0) {
    const delta = ((thisM - lastM) / lastM) * 100;
    if (delta <= -10) {
      insights.push({
        id: 'revenue-drop',
        severity: 'critical',
        category: 'revenue',
        title: 'Doanh thu tháng này giảm mạnh',
        description: `So với tháng trước, doanh thu đã giảm ${Math.abs(delta).toFixed(1)}%. Nên xem xét chạy promotion mới hoặc đẩy mạnh marketing cho các sự kiện đang mở bán.`,
        metric: { value: `${delta.toFixed(1)}%`, label: 'so với tháng trước' },
        action: { label: 'Xem phân tích', href: '/admin/analytics' },
      });
    } else if (delta >= 15) {
      insights.push({
        id: 'revenue-up',
        severity: 'opportunity',
        category: 'revenue',
        title: 'Đà tăng trưởng tốt',
        description: `Doanh thu tháng này tăng ${delta.toFixed(1)}% so với tháng trước. Đây là thời điểm tốt để mở thêm sự kiện hoặc tăng nguồn cung vé.`,
        metric: { value: `+${delta.toFixed(1)}%`, label: 'so với tháng trước' },
      });
    }
  }

  // ── 2. Events under-selling (fill rate < 30%, still > 7 days away) ──
  const [underselling] = await pool.query<RowDataPacket[]>(
    `SELECT e.id, e.title, e.event_date,
            COUNT(s.id) AS total_seats,
            SUM(CASE WHEN s.status IN ('reserved','sold') THEN 1 ELSE 0 END) AS sold_seats
     FROM events e
     JOIN seat_zones sz ON sz.event_id = e.id
     JOIN seats s        ON s.zone_id   = sz.id
     WHERE e.status = 'published'
       AND e.event_date > DATE_ADD(NOW(), INTERVAL 7 DAY)
     GROUP BY e.id
     HAVING total_seats > 0 AND (sold_seats/total_seats) < 0.30
     ORDER BY (sold_seats/total_seats) ASC
     LIMIT 3`,
  );
  underselling.forEach((ev, i) => {
    const fillRate = (Number(ev.sold_seats) / Number(ev.total_seats)) * 100;
    insights.push({
      id: `under-sell-${ev.id}`,
      severity: 'warning',
      category: 'pricing',
      title: i === 0 ? 'Sự kiện bán chậm cần đẩy mạnh' : `Tiếp: ${ev.title.slice(0, 30)}…`,
      description: `"${ev.title}" mới bán được ${fillRate.toFixed(0)}% số ghế. Đề xuất tạo mã giảm giá 10–15% hoặc chạy email reminder cho khách đã xem trang chi tiết.`,
      metric: { value: `${fillRate.toFixed(0)}%`, label: 'fill rate' },
      action: { label: 'Tạo mã giảm giá', href: '/admin/promo-codes' },
    });
  });

  // ── 3. Hot events (>= 80% sold) → upsell opportunity ──────────────────
  const [hot] = await pool.query<RowDataPacket[]>(
    `SELECT e.id, e.title,
            COUNT(s.id) AS total_seats,
            SUM(CASE WHEN s.status IN ('reserved','sold') THEN 1 ELSE 0 END) AS sold_seats
     FROM events e
     JOIN seat_zones sz ON sz.event_id = e.id
     JOIN seats s        ON s.zone_id   = sz.id
     WHERE e.status='published' AND e.event_date > NOW()
     GROUP BY e.id
     HAVING total_seats > 0 AND (sold_seats/total_seats) >= 0.80
     ORDER BY (sold_seats/total_seats) DESC
     LIMIT 2`,
  );
  hot.forEach(ev => {
    const fr = (Number(ev.sold_seats) / Number(ev.total_seats)) * 100;
    insights.push({
      id: `hot-${ev.id}`,
      severity: 'opportunity',
      category: 'events',
      title: 'Sự kiện hot — có thể tăng giá',
      description: `"${ev.title}" đã bán ${fr.toFixed(0)}% số ghế. Cân nhắc tăng giá zone còn lại 10–20% hoặc mở thêm zone mới để tối đa lợi nhuận.`,
      metric: { value: `${fr.toFixed(0)}%`, label: 'fill rate' },
      action: { label: 'Xem sự kiện', href: `/admin/events` },
    });
  });

  // ── 4. Pending bookings backlog ────────────────────────────────────────
  const [[pendingRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM bookings
     WHERE status='pending' AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE)`,
  );
  if (Number(pendingRow.cnt) >= 10) {
    insights.push({
      id: 'pending-backlog',
      severity: 'warning',
      category: 'operations',
      title: 'Nhiều đơn pending quá hạn',
      description: `Có ${pendingRow.cnt} đơn đang treo trên 30 phút. Đề xuất kiểm tra cron-job hoặc gửi reminder xác nhận cho khách.`,
      metric: { value: String(pendingRow.cnt), label: 'đơn quá hạn' },
      action: { label: 'Xem đơn pending', href: '/admin/bookings' },
    });
  }

  // ── 5. Cancellation rate ───────────────────────────────────────────────
  const [[cancelRow]] = await pool.query<RowDataPacket[]>(
    `SELECT
       SUM(status='cancelled') AS cancelled,
       SUM(status IN ('confirmed','cancelled')) AS total
     FROM bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
  );
  const total30 = Number(cancelRow.total ?? 0);
  if (total30 > 20) {
    const rate = (Number(cancelRow.cancelled ?? 0) / total30) * 100;
    if (rate >= 15) {
      insights.push({
        id: 'cancel-rate',
        severity: 'warning',
        category: 'operations',
        title: 'Tỷ lệ huỷ đơn cao bất thường',
        description: `${rate.toFixed(1)}% đơn trong 30 ngày qua bị huỷ. Hãy xem các sự kiện có tỷ lệ huỷ cao nhất và liên hệ khách để khảo sát lý do.`,
        metric: { value: `${rate.toFixed(1)}%`, label: 'tỷ lệ huỷ' },
      });
    }
  }

  // ── 6. Promo code under-utilization ────────────────────────────────────
  const [unused] = await pool.query<RowDataPacket[]>(
    `SELECT pc.code, pc.max_uses, pc.used_count
     FROM promo_codes pc
     WHERE pc.is_active = TRUE
       AND pc.expires_at > NOW()
       AND pc.expires_at < DATE_ADD(NOW(), INTERVAL 14 DAY)
       AND pc.max_uses > 0
       AND (pc.used_count / pc.max_uses) < 0.10
     ORDER BY pc.expires_at ASC
     LIMIT 1`,
  );
  if (unused.length > 0) {
    const pc = unused[0];
    const usage = pc.max_uses ? ((Number(pc.used_count) / Number(pc.max_uses)) * 100).toFixed(0) : '0';
    insights.push({
      id: `promo-unused-${pc.code}`,
      severity: 'opportunity',
      category: 'pricing',
      title: 'Mã giảm giá ít được dùng',
      description: `Mã "${pc.code}" mới được dùng ${usage}% trước khi hết hạn. Cân nhắc gửi email broadcast hoặc đặt banner home để tăng độ phủ.`,
      metric: { value: `${usage}%`, label: 'usage rate' },
      action: { label: 'Xem mã', href: '/admin/promo-codes' },
    });
  }

  // ── 7. Forecast — extrapolate next month ──────────────────────────────
  const [last3] = await pool.query<RowDataPacket[]>(
    `SELECT MONTH(created_at) AS m, SUM(total_amount) AS rev
     FROM bookings
     WHERE status='confirmed' AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
     GROUP BY m ORDER BY m`,
  );
  const last3Vals = last3.map(r => Number(r.rev));
  const avg3 = last3Vals.length > 0 ? last3Vals.reduce((a, b) => a + b, 0) / last3Vals.length : 0;

  return {
    insights,
    summary: {
      total: insights.length,
      critical:    insights.filter(i => i.severity === 'critical').length,
      warning:     insights.filter(i => i.severity === 'warning').length,
      opportunity: insights.filter(i => i.severity === 'opportunity').length,
    },
    forecast: {
      avg_3_months: avg3,
      next_month_estimate: avg3, // simple — same as 3-month avg
      confidence: last3Vals.length === 3 ? 'medium' : 'low' as 'medium' | 'low',
    },
  };
}

export async function listUsers(page = 1, limit = 20, search?: string) {
  const offset = (page - 1) * limit;
  const params: (string | number)[] = [];
  let where = '';

  if (search) {
    where = 'WHERE full_name LIKE ? OR email LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, email, full_name, role, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [[countRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    params,
  );

  return {
    users: rows,
    pagination: { page, limit, total: Number(countRow.total), total_pages: Math.ceil(countRow.total / limit) },
  };
}

export async function listAdminBookings(
  page = 1,
  limit = 20,
  status?: string,
  search?: string,
) {
  const offset = (page - 1) * limit;
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (status && status !== 'all') {
    conditions.push('b.status = ?');
    params.push(status);
  }
  if (search) {
    conditions.push('(u.full_name LIKE ? OR u.email LIKE ? OR e.title LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       b.id,
       b.status,
       b.total_amount,
       b.created_at,
       b.confirmed_at,
       u.full_name  AS user_name,
       u.email      AS user_email,
       e.title      AS event_title,
       e.event_date,
       COUNT(t.id)  AS ticket_count
     FROM bookings b
     JOIN users  u ON u.id = b.user_id
     JOIN events e ON e.id = b.event_id
     LEFT JOIN tickets t ON t.booking_id = b.id
     ${where}
     GROUP BY b.id
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [[countRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM bookings b
     JOIN users  u ON u.id = b.user_id
     JOIN events e ON e.id = b.event_id
     ${where}`,
    params,
  );

  return {
    bookings: rows.map(r => ({
      id:           Number(r.id),
      status:       r.status as string,
      total_amount: Number(r.total_amount),
      created_at:   r.created_at as string,
      confirmed_at: r.confirmed_at as string | null,
      user_name:    r.user_name as string,
      user_email:   r.user_email as string,
      event_title:  r.event_title as string,
      event_date:   r.event_date as string,
      ticket_count: Number(r.ticket_count),
    })),
    pagination: {
      page, limit,
      total: Number(countRow.total),
      total_pages: Math.ceil(Number(countRow.total) / limit),
    },
  };
}

function mapSystemSettings(row: SystemSettingsRow) {
  return {
    company_name: row.company_name,
    support_email: row.support_email,
    address: row.address,
    ticket_hold_minutes: Number(row.ticket_hold_minutes),
    max_tickets_per_booking: Number(row.max_tickets_per_booking),
    timezone: row.timezone,
    language: row.language,
    maintenance_mode: Boolean(row.maintenance_mode),
    payment_sandbox_mode: Boolean(row.payment_sandbox_mode),
    updated_at: row.updated_at,
  };
}

export async function getSystemSettings() {
  const [rows] = await pool.query<SystemSettingsRow[]>(
    'SELECT * FROM admin_system_settings WHERE id = 1',
  );
  if (rows.length === 0) throw AppError.notFound('Chưa có cấu hình hệ thống', 'ADMIN_SETTINGS_NOT_FOUND');
  return mapSystemSettings(rows[0]);
}

export async function updateSystemSettings(input: UpdateSystemSettingsInput) {
  await getSystemSettings();
  await pool.execute<ResultSetHeader>(
    `UPDATE admin_system_settings
     SET company_name = ?, support_email = ?, address = ?,
         ticket_hold_minutes = ?, max_tickets_per_booking = ?,
         timezone = ?, language = ?, maintenance_mode = ?
     WHERE id = 1`,
    [
      input.company_name,
      input.support_email,
      input.address,
      input.ticket_hold_minutes,
      input.max_tickets_per_booking,
      input.timezone,
      input.language,
      input.maintenance_mode,
    ],
  );
  invalidateRuntimeSystemSettingsCache();
  return getSystemSettings();
}

export async function updatePaymentSandboxMode(paymentSandboxMode: boolean) {
  await getSystemSettings();
  await pool.execute<ResultSetHeader>(
    'UPDATE admin_system_settings SET payment_sandbox_mode = ? WHERE id = 1',
    [paymentSandboxMode],
  );
  return getSystemSettings();
}

function mapPaymentGateway(row: PaymentGatewayRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    enabled: Boolean(row.enabled),
    partner_code: row.partner_code,
    access_key: row.access_key,
    secret_key_set: Boolean(row.secret_key),
    webhook_url: row.webhook_url,
    updated_at: row.updated_at,
  };
}

export async function listPaymentGateways() {
  const [rows] = await pool.query<PaymentGatewayRow[]>(
    `SELECT * FROM payment_gateways
     ORDER BY FIELD(id, 'vnpay', 'momo', 'stripe'), name ASC`,
  );
  return rows.map(mapPaymentGateway);
}

export async function updatePaymentGateway(id: string, input: UpdatePaymentGatewayInput) {
  const [rows] = await pool.execute<PaymentGatewayRow[]>(
    'SELECT * FROM payment_gateways WHERE id = ?',
    [id],
  );
  if (rows.length === 0) throw AppError.notFound('Cổng thanh toán không tồn tại', 'PAYMENT_GATEWAY_NOT_FOUND');

  const secretKey = input.secret_key === undefined
    ? rows[0].secret_key
    : input.secret_key;

  await pool.execute<ResultSetHeader>(
    `UPDATE payment_gateways
     SET enabled = ?, partner_code = ?, access_key = ?, secret_key = ?
     WHERE id = ?`,
    [
      input.enabled,
      input.partner_code,
      input.access_key,
      secretKey,
      id,
    ],
  );

  const [updated] = await pool.execute<PaymentGatewayRow[]>(
    'SELECT * FROM payment_gateways WHERE id = ?',
    [id],
  );
  return mapPaymentGateway(updated[0]);
}

function mapSmtpSettings(row: SmtpSettingsRow) {
  return {
    host: row.host,
    port: Number(row.port),
    from_name: row.from_name,
    from_email: row.from_email,
    username: row.username,
    password_set: Boolean(row.password),
    encryption: row.encryption,
    updated_at: row.updated_at,
  };
}

export async function getMailSettings() {
  const [[smtp], [templates]] = await Promise.all([
    pool.query<SmtpSettingsRow[]>('SELECT * FROM smtp_settings WHERE id = 1'),
    pool.query<EmailTemplateRow[]>('SELECT * FROM email_templates ORDER BY name ASC'),
  ]);

  if (smtp.length === 0) throw AppError.notFound('Chưa có cấu hình SMTP', 'SMTP_SETTINGS_NOT_FOUND');

  return {
    smtp: mapSmtpSettings(smtp[0]),
    templates: templates.map((row) => ({
      id: row.id,
      name: row.name,
      subject: row.subject,
      body: row.body,
      status: row.status,
      updated_at: row.updated_at,
    })),
  };
}

export async function updateSmtpSettings(input: UpdateSmtpSettingsInput) {
  const settings = await getMailSettings();
  const password = input.password === undefined
    ? null
    : input.password;

  await pool.execute<ResultSetHeader>(
    `UPDATE smtp_settings
     SET host = ?, port = ?, from_name = ?, from_email = ?,
         username = ?, password = COALESCE(?, password), encryption = ?
     WHERE id = 1`,
    [
      input.host,
      input.port,
      input.from_name,
      input.from_email,
      input.username,
      password,
      input.encryption,
    ],
  );

  void settings;
  const updated = await getMailSettings();
  return updated.smtp;
}

export async function updateEmailTemplate(id: string, input: UpdateEmailTemplateInput) {
  const [rows] = await pool.execute<EmailTemplateRow[]>(
    'SELECT * FROM email_templates WHERE id = ?',
    [id],
  );
  if (rows.length === 0) throw AppError.notFound('Mẫu email không tồn tại', 'EMAIL_TEMPLATE_NOT_FOUND');

  await pool.execute<ResultSetHeader>(
    `UPDATE email_templates
     SET subject = ?, body = ?, status = ?
     WHERE id = ?`,
    [input.subject, input.body, input.status, id],
  );

  const [updated] = await pool.execute<EmailTemplateRow[]>(
    'SELECT * FROM email_templates WHERE id = ?',
    [id],
  );
  return updated[0];
}
