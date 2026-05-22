import prisma from '../../../config/prisma';

const DAY_MS = 86_400_000;

function amount(value: { toNumber(): number } | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : value.toNumber();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function quarterStart(date: Date) {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
}

function pct(cur: number, prev: number) {
  return prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : null;
}

function seatCounts(event: {
  seat_zones: Array<{ seats: Array<{ status: 'available' | 'locked' | 'sold' }> }>;
}) {
  const seats = event.seat_zones.flatMap((zone) => zone.seats);
  const soldSeats = seats.filter((seat) => seat.status === 'sold').length;
  return {
    total_seats: seats.length,
    sold_seats: soldSeats,
    fill_rate: seats.length ? Math.round((soldSeats / seats.length) * 1000) / 10 : 0,
  };
}

function occupiedSeatCounts(event: {
  seat_zones: Array<{ seats: Array<{ status: 'available' | 'locked' | 'sold' }> }>;
}) {
  const seats = event.seat_zones.flatMap((zone) => zone.seats);
  const occupiedSeats = seats.filter((seat) => seat.status !== 'available').length;
  return {
    total_seats: seats.length,
    occupied_seats: occupiedSeats,
    fill_rate: seats.length ? occupiedSeats / seats.length : 0,
  };
}

export async function getDashboardStats() {
  const [
    bookingAgg,
    customers,
    totalEvents,
    publishedEvents,
    completedEvents,
    totalTickets,
  ] = await prisma.$transaction([
    prisma.bookings.aggregate({
      where: { status: 'confirmed' },
      _count: { id: true },
      _sum: { total_amount: true },
    }),
    prisma.bookings.findMany({
      where: { status: 'confirmed' },
      distinct: ['user_id'],
      select: { user_id: true },
    }),
    prisma.events.count(),
    prisma.events.count({ where: { status: 'published' } }),
    prisma.events.count({ where: { status: 'completed' } }),
    prisma.tickets.count(),
  ]);
  return {
    revenue: amount(bookingAgg._sum.total_amount),
    total_bookings: bookingAgg._count.id,
    total_customers: customers.length,
    events: {
      total: totalEvents,
      published: publishedEvents,
      completed: completedEvents,
    },
    total_tickets: totalTickets,
  };
}

export async function getRevenueByMonth(year: number) {
  const rows = await prisma.bookings.findMany({
    where: {
      status: 'confirmed',
      confirmed_at: {
        gte: startOfMonth(year, 0),
        lt: startOfMonth(year + 1, 0),
      },
    },
    select: { confirmed_at: true, total_amount: true },
  });
  const grouped = new Map<number, { revenue: number; bookings: number }>();
  rows.forEach((row) => {
    if (!row.confirmed_at) return;
    const month = row.confirmed_at.getMonth() + 1;
    const current = grouped.get(month) ?? { revenue: 0, bookings: 0 };
    current.revenue += amount(row.total_amount);
    current.bookings += 1;
    grouped.set(month, current);
  });
  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([month, value]) => ({ month, ...value }));
}

export async function getRevenueByDay(year: number, month: number) {
  const start = startOfMonth(year, month - 1);
  const end = addMonths(start, 1);
  const rows = await prisma.bookings.findMany({
    where: { status: 'confirmed', confirmed_at: { gte: start, lt: end } },
    select: { confirmed_at: true, total_amount: true },
  });
  const grouped = new Map<number, { revenue: number; bookings: number }>();
  rows.forEach((row) => {
    if (!row.confirmed_at) return;
    const day = row.confirmed_at.getDate();
    const current = grouped.get(day) ?? { revenue: 0, bookings: 0 };
    current.revenue += amount(row.total_amount);
    current.bookings += 1;
    grouped.set(day, current);
  });
  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, value]) => ({ day, ...value }));
}

export async function getFillRates() {
  const rows = await prisma.events.findMany({
    where: { status: { in: ['published', 'completed'] } },
    include: { seat_zones: { include: { seats: { select: { status: true } } } } },
    orderBy: { event_date: 'desc' },
    take: 20,
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    event_date: row.event_date,
    status: row.status,
    poster_url: row.poster_url,
    ...seatCounts(row),
  }));
}

export async function getCategoryStats() {
  const rows = await prisma.bookings.findMany({
    where: { status: 'confirmed' },
    select: {
      id: true,
      total_amount: true,
      events: { select: { id: true, category: true } },
    },
  });
  const grouped = new Map<string, { bookings: number; revenue: number; eventIds: Set<number> }>();
  
  // Pre-fill all 8 categories
  const ALL_CATEGORIES = ['music', 'arts', 'sports', 'food', 'entertainment', 'workshop', 'stage', 'other'];
  ALL_CATEGORIES.forEach(cat => {
    grouped.set(cat, { bookings: 0, revenue: 0, eventIds: new Set<number>() });
  });

  rows.forEach((row) => {
    const key = row.events.category;
    const current = grouped.get(key) ?? { bookings: 0, revenue: 0, eventIds: new Set<number>() };
    current.bookings += 1;
    current.revenue += amount(row.total_amount);
    current.eventIds.add(row.events.id);
    grouped.set(key, current);
  });
  return [...grouped.entries()]
    .map(([category, value]) => ({
      category,
      bookings: value.bookings,
      revenue: value.revenue,
      event_count: value.eventIds.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getAudienceStats() {
  const rows = await prisma.bookings.findMany({
    where: { status: 'confirmed' },
    select: { users: { select: { gender: true, birth_date: true } } },
  });
  const now = new Date();
  const gender = new Map<string | null, number>();
  const age = new Map<string, number>();
  rows.forEach(({ users }) => {
    gender.set(users.gender, (gender.get(users.gender) ?? 0) + 1);
    if (!users.birth_date) return;
    let years = now.getFullYear() - users.birth_date.getFullYear();
    const beforeBirthday = now.getMonth() < users.birth_date.getMonth()
      || (now.getMonth() === users.birth_date.getMonth() && now.getDate() < users.birth_date.getDate());
    if (beforeBirthday) years -= 1;
    const label = years < 18 ? 'Under 18'
      : years <= 24 ? '18-24'
        : years <= 34 ? '25-34'
          : years <= 44 ? '35-44'
            : '45+';
    age.set(label, (age.get(label) ?? 0) + 1);
  });
  const ageOrder = ['Under 18', '18-24', '25-34', '35-44', '45+'];
  return {
    gender: [...gender.entries()].map(([genderValue, count]) => ({ gender: genderValue, count })),
    age: ageOrder.filter((label) => age.has(label)).map((age_group) => ({ age_group, count: age.get(age_group) })),
  };
}

export async function getComparisonStats() {
  const now = new Date();
  const currentMonthStart = startOfMonth(now.getFullYear(), now.getMonth());
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const previousMonthStart = addMonths(currentMonthStart, -1);
  const yearStart = startOfMonth(now.getFullYear(), 0);
  const previousYearStart = startOfMonth(now.getFullYear() - 1, 0);
  const previousYtdEnd = addMonths(previousYearStart, now.getMonth() + 1);
  const currentQuarterStart = quarterStart(now);
  const nextQuarterStart = addMonths(currentQuarterStart, 3);
  const previousQuarterStart = addMonths(currentQuarterStart, -3);
  const rows = await prisma.bookings.findMany({
    where: { status: 'confirmed' },
    select: { total_amount: true, confirmed_at: true },
  });
  let curMonthRev = 0;
  let prevMonthRev = 0;
  let curMonthBook = 0;
  let prevMonthBook = 0;
  let ytdRev = 0;
  let prevYtdRev = 0;
  let curQuarterRev = 0;
  let prevQuarterRev = 0;
  let curQuarterBook = 0;
  let prevQuarterBook = 0;
  let totalRevenue = 0;
  rows.forEach((row) => {
    if (!row.confirmed_at) return;
    const value = amount(row.total_amount);
    totalRevenue += value;
    if (row.confirmed_at >= currentMonthStart && row.confirmed_at < nextMonthStart) {
      curMonthRev += value;
      curMonthBook += 1;
    }
    if (row.confirmed_at >= previousMonthStart && row.confirmed_at < currentMonthStart) {
      prevMonthRev += value;
      prevMonthBook += 1;
    }
    if (row.confirmed_at >= yearStart && row.confirmed_at < nextMonthStart) ytdRev += value;
    if (row.confirmed_at >= previousYearStart && row.confirmed_at < previousYtdEnd) prevYtdRev += value;
    if (row.confirmed_at >= currentQuarterStart && row.confirmed_at < nextQuarterStart) {
      curQuarterRev += value;
      curQuarterBook += 1;
    }
    if (row.confirmed_at >= previousQuarterStart && row.confirmed_at < currentQuarterStart) {
      prevQuarterRev += value;
      prevQuarterBook += 1;
    }
  });
  return {
    cur_month_revenue: curMonthRev,
    prev_month_revenue: prevMonthRev,
    revenue_change_pct: pct(curMonthRev, prevMonthRev),
    cur_month_bookings: curMonthBook,
    prev_month_bookings: prevMonthBook,
    bookings_change_pct: pct(curMonthBook, prevMonthBook),
    ytd_revenue: ytdRev,
    prev_ytd_revenue: prevYtdRev,
    ytd_change_pct: pct(ytdRev, prevYtdRev),
    cur_quarter_revenue: curQuarterRev,
    prev_quarter_revenue: prevQuarterRev,
    quarter_change_pct: pct(curQuarterRev, prevQuarterRev),
    cur_quarter_bookings: curQuarterBook,
    prev_quarter_bookings: prevQuarterBook,
    quarter_bookings_change_pct: pct(curQuarterBook, prevQuarterBook),
    avg_order_value: rows.length ? totalRevenue / rows.length : 0,
  };
}

export async function getTopEvents(limit = 5) {
  const rows = await prisma.events.findMany({
    include: {
      bookings: { where: { status: 'confirmed' }, select: { id: true, total_amount: true } },
      seat_zones: { include: { seats: { select: { status: true } } } },
    },
  });
  return rows
    .map((row) => ({
      id: row.id,
      title: row.title,
      event_date: row.event_date,
      venue: row.venue,
      status: row.status,
      poster_url: row.poster_url,
      revenue: row.bookings.reduce((sum, booking) => sum + amount(booking.total_amount), 0),
      bookings: row.bookings.length,
      ...seatCounts(row),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

function formatMoneySvc(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' tr';
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
  const now = new Date();
  const monthName = now.toLocaleDateString('vi-VN', { month: 'long' });
  const year = now.getFullYear();
  const parts: string[] = [];
  if (data.revChangePct !== null) {
    const trend = data.revChangePct >= 0 ? `tăng ${data.revChangePct}%` : `giảm ${Math.abs(data.revChangePct)}%`;
    parts.push(`Doanh thu ${monthName} ${trend} so với tháng trước, đạt ${formatMoneySvc(data.curMonthRev)}.`);
  } else {
    parts.push(`Doanh thu ${monthName} đạt ${formatMoneySvc(data.curMonthRev)}.`);
  }
  if (data.ytdChangePct !== null) {
    const ytdTrend = data.ytdChangePct >= 0
      ? `tăng ${data.ytdChangePct}%`
      : `giảm ${Math.abs(data.ytdChangePct)}%`;
    parts.push(`Lũy kế ${year} đạt ${formatMoneySvc(data.ytdRev)}, ${ytdTrend} so với cùng kỳ năm ngoái.`);
  } else if (data.ytdRev > 0) {
    parts.push(`Lũy kế ${year} đạt ${formatMoneySvc(data.ytdRev)}.`);
  }
  if (data.topEventTitle) parts.push(`Sự kiện dẫn đầu doanh thu: "${data.topEventTitle}".`);
  if (data.publishedEvents > 0) parts.push(`Hiện có ${data.publishedEvents} sự kiện đang mở bán.`);
  if (data.avgOrder > 0) parts.push(`Giá trị đơn hàng trung bình ${formatMoneySvc(data.avgOrder)}.`);
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
      const now = new Date();
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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
          }),
        },
      );
      if (res.ok) {
        const json = await res.json() as { candidates?: { content: { parts: { text: string }[] } }[] };
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
      }
    } catch {
      // Third-party summary generation is optional; fall back to deterministic copy.
    }
  }
  return buildRuleBasedSummary(params);
}

export async function getAdvancedStats() {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * DAY_MS);
  const thisMonth = startOfMonth(now.getFullYear(), now.getMonth());
  const [
    recentBookings,
    confirmedBookings,
    confirmedTicketCount,
  ] = await prisma.$transaction([
    prisma.bookings.findMany({
      where: { created_at: { gte: last30 } },
      select: { status: true },
    }),
    prisma.bookings.findMany({
      where: { status: 'confirmed' },
      select: {
        user_id: true,
        total_amount: true,
        discount_amount: true,
        promo_code_id: true,
        confirmed_at: true,
        events: { select: { event_date: true } },
      },
    }),
    prisma.tickets.count({ where: { bookings: { status: 'confirmed' } } }),
  ]);
  const cancelled = recentBookings.filter((booking) => booking.status === 'cancelled').length;
  const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + amount(booking.total_amount), 0);
  const perCustomer = new Map<number, number>();
  confirmedBookings.forEach((booking) => {
    perCustomer.set(booking.user_id, (perCustomer.get(booking.user_id) ?? 0) + 1);
  });
  const repeatCustomers = [...perCustomer.values()].filter((count) => count > 1).length;
  const leadTimes = confirmedBookings
    .filter((booking) => booking.confirmed_at && booking.confirmed_at < booking.events.event_date)
    .map((booking) => (booking.events.event_date.getTime() - booking.confirmed_at!.getTime()) / DAY_MS);
  const withPromo = confirmedBookings.filter((booking) => booking.promo_code_id !== null).length;
  const totalDiscount = confirmedBookings.reduce((sum, booking) => sum + amount(booking.discount_amount), 0);
  const grossRevenue = confirmedBookings.reduce(
    (sum, booking) => sum + amount(booking.total_amount) + amount(booking.discount_amount),
    0,
  );
  const bookingsThisMonth = confirmedBookings.filter(
    (booking) => booking.confirmed_at && booking.confirmed_at >= thisMonth,
  ).length;
  return {
    cancellation_rate: recentBookings.length
      ? Math.round((cancelled / recentBookings.length) * 1000) / 10
      : 0,
    revenue_per_ticket: confirmedTicketCount ? Math.round(totalRevenue / confirmedTicketCount) : 0,
    repeat_customer_pct: perCustomer.size
      ? Math.round((repeatCustomers / perCustomer.size) * 1000) / 10
      : 0,
    avg_lead_days: leadTimes.length
      ? Math.round((leadTimes.reduce((sum, value) => sum + value, 0) / leadTimes.length) * 10) / 10
      : 0,
    promo_usage_pct: confirmedBookings.length
      ? Math.round((withPromo / confirmedBookings.length) * 1000) / 10
      : 0,
    discount_impact_pct: grossRevenue ? Math.round((totalDiscount / grossRevenue) * 1000) / 10 : 0,
    bookings_per_day: now.getDate() ? Math.round((bookingsThisMonth / now.getDate()) * 10) / 10 : 0,
  };
}

export async function getTodayStats() {
  const todayStart = startOfDay(new Date());
  const yesterdayStart = new Date(todayStart.getTime() - DAY_MS);
  const sixDaysAgoStart = new Date(todayStart.getTime() - 6 * DAY_MS);
  const rows = await prisma.bookings.findMany({
    where: { status: 'confirmed', confirmed_at: { gte: sixDaysAgoStart } },
    select: {
      total_amount: true,
      confirmed_at: true,
      events: { select: { category: true } },
    },
  });
  const weekly = new Map<string, { revenue: number; bookings: number }>();
  const weeklyCategory = new Map<string, { revenue: number; bookings: number }>();
  
  // Pre-fill all 8 categories
  const ALL_CATEGORIES = ['music', 'arts', 'sports', 'food', 'entertainment', 'workshop', 'stage', 'other'];
  ALL_CATEGORIES.forEach(cat => {
    weeklyCategory.set(cat, { revenue: 0, bookings: 0 });
  });

  let revenueToday = 0;
  let revenueYesterday = 0;
  let bookingsToday = 0;
  let bookingsYesterday = 0;
  let revenue7d = 0;
  rows.forEach((row) => {
    if (!row.confirmed_at) return;
    const value = amount(row.total_amount);
    const dayStart = startOfDay(row.confirmed_at);
    revenue7d += value;
    if (dayStart.getTime() === todayStart.getTime()) {
      revenueToday += value;
      bookingsToday += 1;
    }
    if (dayStart.getTime() === yesterdayStart.getTime()) {
      revenueYesterday += value;
      bookingsYesterday += 1;
    }
    const day = row.confirmed_at.toISOString().slice(0, 10);
    const currentDay = weekly.get(day) ?? { revenue: 0, bookings: 0 };
    currentDay.revenue += value;
    currentDay.bookings += 1;
    weekly.set(day, currentDay);
    const category = row.events.category;
    const currentCategory = weeklyCategory.get(category) ?? { revenue: 0, bookings: 0 };
    currentCategory.revenue += value;
    currentCategory.bookings += 1;
    weeklyCategory.set(category, currentCategory);
  });
  return {
    revenue_today: revenueToday,
    revenue_yesterday: revenueYesterday,
    revenue_today_pct: pct(revenueToday, revenueYesterday),
    bookings_today: bookingsToday,
    bookings_yesterday: bookingsYesterday,
    bookings_today_pct: pct(bookingsToday, bookingsYesterday),
    revenue_7d: revenue7d,
    weekly: [...weekly.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({ day, ...value })),
    weekly_category: [...weeklyCategory.entries()]
      .map(([category, value]) => ({ category, ...value }))
      .sort((a, b) => b.revenue - a.revenue),
  };
}

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
  const now = new Date();
  const thisMonthStart = startOfMonth(now.getFullYear(), now.getMonth());
  const lastMonthStart = addMonths(thisMonthStart, -1);
  const sevenDaysOut = new Date(now.getTime() + 7 * DAY_MS);
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60_000);
  const last30Days = new Date(now.getTime() - 30 * DAY_MS);
  const fourteenDaysOut = new Date(now.getTime() + 14 * DAY_MS);
  const lastThreeMonths = addMonths(thisMonthStart, -2);
  const insights: Insight[] = [];
  const [
    revenueBookings,
    publishedEvents,
    pendingCount,
    recentBookingStatuses,
    promoCandidates,
    forecastBookings,
  ] = await prisma.$transaction([
    prisma.bookings.findMany({
      where: { status: 'confirmed', created_at: { gte: lastMonthStart } },
      select: { total_amount: true, created_at: true },
    }),
    prisma.events.findMany({
      where: { status: 'published', event_date: { gt: now } },
      include: { seat_zones: { include: { seats: { select: { status: true } } } } },
    }),
    prisma.bookings.count({ where: { status: 'pending', created_at: { lt: thirtyMinutesAgo } } }),
    prisma.bookings.findMany({
      where: { created_at: { gte: last30Days }, status: { in: ['confirmed', 'cancelled'] } },
      select: { status: true },
    }),
    prisma.promo_codes.findMany({
      where: {
        is_active: true,
        expires_at: { gt: now, lt: fourteenDaysOut },
        max_uses: { gt: 0 },
      },
      select: { code: true, max_uses: true, used_count: true },
      orderBy: { expires_at: 'asc' },
    }),
    prisma.bookings.findMany({
      where: { status: 'confirmed', created_at: { gte: lastThreeMonths } },
      select: { total_amount: true, created_at: true },
    }),
  ]);
  let thisMonth = 0;
  let lastMonth = 0;
  revenueBookings.forEach((booking) => {
    if (!booking.created_at) return;
    if (booking.created_at >= thisMonthStart) thisMonth += amount(booking.total_amount);
    else if (booking.created_at >= lastMonthStart) lastMonth += amount(booking.total_amount);
  });
  if (lastMonth > 0) {
    const delta = ((thisMonth - lastMonth) / lastMonth) * 100;
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
  publishedEvents
    .filter((event) => event.event_date > sevenDaysOut)
    .map((event) => ({ event, ...occupiedSeatCounts(event) }))
    .filter(({ total_seats, fill_rate }) => total_seats > 0 && fill_rate < 0.30)
    .sort((a, b) => a.fill_rate - b.fill_rate)
    .slice(0, 3)
    .forEach(({ event, fill_rate }, index) => {
      insights.push({
        id: `under-sell-${event.id}`,
        severity: 'warning',
        category: 'pricing',
        title: index === 0 ? 'Sự kiện bán chậm cần đẩy mạnh' : `Tiếp: ${event.title.slice(0, 30)}…`,
        description: `"${event.title}" mới bán được ${(fill_rate * 100).toFixed(0)}% số ghế. Đề xuất tạo mã giảm giá 10–15% hoặc chạy email reminder cho khách đã xem trang chi tiết.`,
        metric: { value: `${(fill_rate * 100).toFixed(0)}%`, label: 'fill rate' },
        action: { label: 'Tạo mã giảm giá', href: '/admin/promo-codes' },
      });
    });
  publishedEvents
    .map((event) => ({ event, ...occupiedSeatCounts(event) }))
    .filter(({ total_seats, fill_rate }) => total_seats > 0 && fill_rate >= 0.80)
    .sort((a, b) => b.fill_rate - a.fill_rate)
    .slice(0, 2)
    .forEach(({ event, fill_rate }) => {
      insights.push({
        id: `hot-${event.id}`,
        severity: 'opportunity',
        category: 'events',
        title: 'Sự kiện hot — có thể tăng giá',
        description: `"${event.title}" đã bán ${(fill_rate * 100).toFixed(0)}% số ghế. Cân nhắc tăng giá zone còn lại 10–20% hoặc mở thêm zone mới để tối đa lợi nhuận.`,
        metric: { value: `${(fill_rate * 100).toFixed(0)}%`, label: 'fill rate' },
        action: { label: 'Xem sự kiện', href: '/admin/events' },
      });
    });
  if (pendingCount >= 10) {
    insights.push({
      id: 'pending-backlog',
      severity: 'warning',
      category: 'operations',
      title: 'Nhiều đơn pending quá hạn',
      description: `Có ${pendingCount} đơn đang treo trên 30 phút. Đề xuất kiểm tra cron-job hoặc gửi reminder xác nhận cho khách.`,
      metric: { value: String(pendingCount), label: 'đơn quá hạn' },
      action: { label: 'Xem đơn pending', href: '/admin/bookings' },
    });
  }
  if (recentBookingStatuses.length > 20) {
    const cancelled = recentBookingStatuses.filter((booking) => booking.status === 'cancelled').length;
    const rate = (cancelled / recentBookingStatuses.length) * 100;
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
  const unusedPromo = promoCandidates.find((promo) =>
    promo.max_uses !== null && promo.used_count / promo.max_uses < 0.10);
  if (unusedPromo?.max_uses) {
    const usage = ((unusedPromo.used_count / unusedPromo.max_uses) * 100).toFixed(0);
    insights.push({
      id: `promo-unused-${unusedPromo.code}`,
      severity: 'opportunity',
      category: 'pricing',
      title: 'Mã giảm giá ít được dùng',
      description: `Mã "${unusedPromo.code}" mới được dùng ${usage}% trước khi hết hạn. Cân nhắc gửi email broadcast hoặc đặt banner home để tăng độ phủ.`,
      metric: { value: `${usage}%`, label: 'usage rate' },
      action: { label: 'Xem mã', href: '/admin/promo-codes' },
    });
  }
  const monthlyRevenue = new Map<string, number>();
  forecastBookings.forEach((booking) => {
    if (!booking.created_at) return;
    const key = `${booking.created_at.getFullYear()}-${booking.created_at.getMonth() + 1}`;
    monthlyRevenue.set(key, (monthlyRevenue.get(key) ?? 0) + amount(booking.total_amount));
  });
  const last3Vals = [...monthlyRevenue.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, revenue]) => revenue);
  const avg3 = last3Vals.length
    ? last3Vals.reduce((sum, revenue) => sum + revenue, 0) / last3Vals.length
    : 0;
  return {
    insights,
    summary: {
      total: insights.length,
      critical: insights.filter((insight) => insight.severity === 'critical').length,
      warning: insights.filter((insight) => insight.severity === 'warning').length,
      opportunity: insights.filter((insight) => insight.severity === 'opportunity').length,
    },
    forecast: {
      avg_3_months: avg3,
      next_month_estimate: avg3,
      confidence: last3Vals.length === 3 ? 'medium' : 'low' as 'medium' | 'low',
    },
  };
}
