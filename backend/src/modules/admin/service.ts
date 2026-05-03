import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';

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

export async function getFillRates() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       e.id, e.title, e.event_date, e.status,
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
    total_seats: Number(r.total_seats),
    sold_seats: Number(r.sold_seats),
    fill_rate: Number(r.fill_rate ?? 0),
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
