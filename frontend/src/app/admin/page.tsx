'use client';
import dynamic from "next/dynamic";
const CategoryDonut = dynamic(() => import("@/components/admin/CategoryDonut"), { ssr: false });


import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownRight,
  CalendarDays, TrendingUp, Receipt, Users,
  Plus, Tag, BarChart2, Newspaper,
  Flame,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fadeUp, staggerContainer } from '@/lib/motion';
import api from '@/lib/api/client';
import { listPosts } from '@/lib/api/posts';
import { useAuthStore } from '@/stores/authStore';
import { formatPostDate } from '@/lib/utils/posts';
import type { Post } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

interface DashboardStats {
  revenue: number;
  total_bookings: number;
  total_customers: number;
  events: { total: number; published: number; completed: number };
  total_tickets: number;
}

interface TodayStats {
  revenue_today: number;
  revenue_yesterday: number;
  revenue_today_pct: number | null;
  bookings_today: number;
  bookings_yesterday: number;
  bookings_today_pct: number | null;
  revenue_7d: number;
  weekly: { day: string; revenue: number; bookings: number }[];
  weekly_category: { category: string; bookings: number; revenue: number }[];
}

interface FillRate {
  id: number;
  title: string;
  event_date: string;
  status: string;
  total_seats: number;
  sold_seats: number;
  fill_rate: number;
  poster_url?: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'tr';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'k';
  return n.toLocaleString('vi-VN');
}


// Day-of-week label (Mon…Sun → T2…CN)
function dayLabel(iso: string) {
  const d = new Date(iso).getDay(); // 0=Sun
  return ['CN','T2','T3','T4','T5','T6','T7'][d];
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

// ── Delta badge ────────────────────────────────────────────────────────────

function Delta({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return <span className="text-[11px] text-stone-400">—</span>;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
      up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
    }`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

// ── Donut chart (pure CSS/SVG) ─────────────────────────────────────────────

// ── Stat tile ──────────────────────────────────────────────────────────────

function StatTile({ label, value, delta, accent, icon: Icon }: {
  label: string;
  value: string;
  delta?: number | null;
  accent: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <Delta pct={delta} />
      </div>
      <p className="text-2xl font-bold tabular-nums text-stone-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-stone-500">{label}</p>
    </div>
  );
}

// ── Quick action pill ─────────────────────────────────────────────────────

function QuickPill({ href, icon: Icon, label, accent }: {
  href: string;
  icon: React.ElementType;
  label: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-soft ${accent}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const [stats,     setStats]     = useState<DashboardStats | null>(null);
  const [todayData, setTodayData] = useState<TodayStats | null>(null);
  const [trending,  setTrending]  = useState<FillRate[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [s, td, fr, posts] = await Promise.all([
        api.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard'),
        api.get<{ success: boolean; data: TodayStats     }>('/admin/today-stats'),
        api.get<{ success: boolean; data: FillRate[]     }>('/admin/fill-rates'),
        listPosts({ status: 'published', sort: 'views', order: 'desc', limit: 5 }),
      ]);
      setStats(s.data.data);
      setTodayData(td.data.data);
      setTrending(
        Array.from(
          new Map(
            (fr.data.data ?? [])
              .filter(e => e.status === 'published')
              .map(e => [e.id, e] as const),
          ).values(),
        )
          .sort((a, b) => b.fill_rate - a.fill_rate)
          .slice(0, 5),
      );
      setPopularPosts(posts.posts);
    } catch { /* silent */ }
    finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load({ silent: true }), 15_000);
    return () => window.clearInterval(id);
  }, [load]);

  const user      = useAuthStore(s => s.user);
  const firstName = user?.full_name?.trim().split(/\s+/).slice(-1)[0] || 'Admin';
  const initials  = user?.full_name
    ? user.full_name.trim().split(/\s+/).slice(-2).map((w: string) => w[0].toUpperCase()).join('')
    : 'A';

  // Fill the weekly array with 7 days (fill missing days with 0)
  const weekly = (() => {
    const result: { day: string; revenue: number; bookings: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const found = todayData?.weekly.find(w => w.day === iso);
      result.push(found ?? { day: iso, revenue: 0, bookings: 0 });
    }
    return result;
  })();

  const weeklyTotalRevenue = weekly.reduce((s, d) => s + d.revenue, 0);
  const weeklyTotalBookings = weekly.reduce((s, d) => s + d.bookings, 0);
  const interestingPosts = popularPosts;

  return (
    <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-5">

      {/* ── Hero card: greeting + quick actions ──────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          {/* Left: avatar + greeting */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <h1 className="page-title">
                {greeting()}, <span className="text-amber-600">{firstName}</span> 👋
              </h1>
              <p className="text-xs text-stone-500">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          {/* Right: quick actions */}
          <div className="flex flex-col items-end gap-1.5">
            <p className="text-[10px] font-medium uppercase tracking-widest text-stone-400">Truy cập nhanh</p>
            <div className="flex flex-wrap justify-end gap-2">
              <QuickPill href="/admin/events/new"  icon={Plus}      label="Tạo sự kiện"  accent="text-amber-700 hover:bg-amber-100/60" />
              <QuickPill href="/admin/posts"        icon={Newspaper} label="Bài đăng" accent="text-violet-700 hover:bg-violet-100/60" />
              <QuickPill href="/admin/promo-codes" icon={Tag}       label="Mã giảm giá"  accent="text-rose-600 hover:bg-rose-100/60" />
              <QuickPill href="/admin/analytics"   icon={BarChart2} label="Phân tích"    accent="text-emerald-700 hover:bg-emerald-100/60" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Today KPI tiles ───────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
        <p className="section-title mb-4">Hôm nay</p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl border border-stone-100 bg-stone-50 px-4 py-3.5">
                <div className="absolute inset-y-0 left-0 w-1 animate-pulse rounded-l-2xl bg-stone-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-stone-200" />
                <div className="mt-2 h-6 w-16 animate-pulse rounded bg-stone-200" />
                <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-stone-200" />
              </div>
            ))
          ) : (
            <>
              <StatTile
                label="Doanh thu"
                value={`${fmtCurrency(todayData?.revenue_today ?? 0)}đ`}
                delta={todayData?.revenue_today_pct}
                accent="bg-amber-200/60 text-amber-700"
                icon={TrendingUp}
              />
              <StatTile
                label="Đơn đặt vé"
                value={String(todayData?.bookings_today ?? 0)}
                delta={todayData?.bookings_today_pct}
                accent="bg-emerald-200/60 text-emerald-700"
                icon={Receipt}
              />
              <StatTile
                label="Sự kiện đang bán"
                value={String(stats?.events.published ?? 0)}
                accent="bg-violet-200/60 text-violet-700"
                icon={CalendarDays}
              />
              <StatTile
                label="Khách hàng"
                value={(stats?.total_customers ?? 0).toLocaleString('vi-VN')}
                accent="bg-sky-200/60 text-sky-700"
                icon={Users}
              />
            </>
          )}
        </div>
      </motion.div>

      {/* ── Weekly chart + category ───────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid gap-4 lg:grid-cols-3">

        {/* Revenue bar chart — 7 days */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="section-title">Doanh thu trong tuần</p>
              <p className="text-xs text-stone-400">7 ngày gần nhất</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold tabular-nums text-stone-900">
              {loading ? <span className="inline-block h-5 w-20 animate-pulse rounded bg-stone-100" /> : `${fmtCurrency(weeklyTotalRevenue)}đ`}
              </p>
              <p className="text-xs text-stone-400">
                {loading ? '' : `${weeklyTotalBookings} đơn`}
              </p>
            </div>
          </div>
          {loading ? (
            <div className="h-[260px] w-full animate-pulse rounded-xl bg-stone-50" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weekly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickFormatter={dayLabel} tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [`${fmtCurrency(Number(v ?? 0))}đ`, 'Doanh thu']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e7e5e4', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}
                />
                <Area
                  type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: '#d97706' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category donut — this week */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <div className="mb-4">
            <p className="section-title">Theo danh mục</p>
            <p className="text-xs text-stone-400">Phân bổ doanh thu tuần này</p>
          </div>
          {loading ? (
            <div className="flex items-center gap-4">
              <div className="h-[72px] w-[72px] shrink-0 animate-pulse rounded-full bg-stone-100" />
              <div className="flex-1 space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-3 animate-pulse rounded bg-stone-100" />
                ))}
              </div>
            </div>
          ) : !todayData?.weekly_category?.length ? (
            <p className="py-[100px] text-center text-sm text-stone-400">Chưa có dữ liệu tuần này</p>
          ) : (
            <CategoryDonut data={todayData.weekly_category} />
          )}
        </div>

      </motion.div>

      {/* ── Hot events ────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" />
            <p className="section-title">Sự kiện nóng nhất</p>
          </div>
          <Link href="/admin/events" className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700">
            Xem tất cả <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="divide-y divide-stone-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="h-6 w-6 shrink-0 animate-pulse rounded-lg bg-stone-100" />
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-stone-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 animate-pulse rounded bg-stone-100" />
                  <div className="h-2.5 w-32 animate-pulse rounded bg-stone-100" />
                </div>
                <div className="h-4 w-12 animate-pulse rounded bg-stone-100" />
              </div>
            ))}
          </div>
        ) : trending.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <CalendarDays className="h-8 w-8 text-stone-200" />
            <p className="text-sm text-stone-400">Chưa có sự kiện đang bán</p>
            <Link href="/admin/events/new" className="text-xs font-medium text-amber-600 hover:underline">Tạo ngay</Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {trending.map((ev, i) => {
              const isHot = ev.fill_rate >= 80;
              const pct   = ev.fill_rate;
              return (
                <div key={ev.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50/60">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                    i === 0 ? 'bg-rose-100 text-rose-600' : i === 1 ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'
                  }`}>{i + 1}</span>
                  {/* Poster thumbnail */}
                  {ev.poster_url
                    ? <Image src={ev.poster_url} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl object-cover" unoptimized />
                    : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-300"><CalendarDays className="h-4 w-4" /></div>
                  }
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{ev.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1 w-20 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className={`h-full rounded-full ${isHot ? 'bg-rose-500' : 'bg-amber-400'}`}
                          style={{ width: pct + '%' }}
                        />
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {ev.sold_seats}/{ev.total_seats} vé
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 text-sm font-bold tabular-nums ${isHot ? 'text-rose-600' : 'text-stone-700'}`}>
                    {pct.toFixed(0)}%
                  </span>
                  <Link
                    href="/admin/events"
                    className="shrink-0 rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-500 transition-colors hover:border-amber-300 hover:text-amber-600"
                  >
                    Xem
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Bài đăng được quan tâm ───────────────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <p className="section-title">Bài đăng được quan tâm</p>
            <p className="text-xs text-stone-400">Nội dung nổi bật ngoài newsroom</p>
          </div>
          <Link href="/admin/posts" className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700">
            Quản lý bài đăng <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="divide-y divide-stone-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="h-6 w-6 shrink-0 animate-pulse rounded-lg bg-stone-100" />
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-stone-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-44 animate-pulse rounded bg-stone-100" />
                  <div className="h-2.5 w-28 animate-pulse rounded bg-stone-100" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-stone-100" />
              </div>
            ))}
          </div>
        ) : interestingPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Newspaper className="h-8 w-8 text-stone-200" />
            <p className="text-sm text-stone-400">Chưa có bài đăng</p>
            <p className="text-xs text-stone-300">Khi có nội dung, các bài đáng chú ý sẽ hiện ở đây</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {interestingPosts.map((post, i) => (
              <Link key={post.id} href={`/news/${post.slug}`} target="_blank" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50/60">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                  i === 0 ? 'bg-amber-100 text-amber-600'
                  : i === 1 ? 'bg-stone-200 text-stone-600'
                  : i === 2 ? 'bg-orange-50 text-orange-500'
                  : 'bg-stone-100 text-stone-400'
                }`}>{i + 1}</span>
                <Image src={post.cover_url} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-xl object-cover" unoptimized />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-stone-800">{post.title}</p>
                  <p className="mt-0.5 text-[11px] text-stone-400">{post.category} · {post.author_name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-stone-900">{post.view_count.toLocaleString('vi-VN')}</p>
                  <p className="text-[11px] text-stone-400">{formatPostDate(post.published_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
