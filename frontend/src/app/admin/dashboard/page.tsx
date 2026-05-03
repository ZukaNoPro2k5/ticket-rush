'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { TrendingUp, Ticket, Users, CalendarDays, PercentIcon } from 'lucide-react';
import { fadeUp } from '@/lib/motion';
import api from '@/lib/api/client';

// Recharts is ~120KB gzipped — lazy-load only when this page mounts.
// SSR off because recharts uses browser APIs.
const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-xl bg-stone-50" />,
});

// ---- Types ---------------------------------------------------------------

interface DashboardStats {
  revenue: number;
  total_bookings: number;
  total_customers: number;
  events: { total: number; published: number; completed: number };
  total_tickets: number;
}

interface RevenueRow { month: number; revenue: number; bookings: number }

interface FillRateRow {
  id: number;
  title: string;
  event_date: string;
  status: string;
  total_seats: number;
  sold_seats: number;
  fill_rate: number;
}

// ---- Helpers -------------------------------------------------------------

function formatMoney(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr';
  return n.toLocaleString('vi-VN') + 'đ';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---- Stat Card -----------------------------------------------------------

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className={`mb-3 inline-flex rounded-xl p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      <p className="mt-0.5 text-sm text-stone-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-stone-400">{sub}</p>}
    </div>
  );
}

// ---- Fill Rate Row -------------------------------------------------------

function FillRow({ row }: { row: FillRateRow }) {
  const pct = row.fill_rate;
  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-stone-200';
  return (
    <div className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0 border-b border-stone-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-stone-800">{row.title}</p>
        <p className="text-xs text-stone-400">{formatDate(row.event_date)}</p>
      </div>
      <div className="flex w-32 items-center gap-2 shrink-0">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${barColor} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="w-9 text-right text-xs font-semibold text-stone-600">{pct}%</span>
      </div>
    </div>
  );
}

// ---- Page ----------------------------------------------------------------

export default function AdminDashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueRow[]>([]);
  const [fillRates, setFillRates] = useState<FillRateRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (y: number) => {
    setLoading(true);
    try {
      const [s, r, f] = await Promise.all([
        api.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard'),
        api.get<{ success: boolean; data: RevenueRow[] }>(`/admin/revenue?year=${y}`),
        api.get<{ success: boolean; data: FillRateRow[] }>('/admin/fill-rates'),
      ]);
      setStats(s.data.data);
      setRevenue(r.data.data);
      setFillRates(f.data.data);
    } catch {
      // stay with previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(year); }, [year, load]);

  // Build full 12-month series (fill missing months with 0)
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const found = revenue.find(r => r.month === m);
    return { month: m, revenue: found?.revenue ?? 0, bookings: found?.bookings ?? 0 };
  });

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-400">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={TrendingUp}
            label="Doanh thu"
            value={formatMoney(stats.revenue)}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            icon={Ticket}
            label="Đơn đặt vé"
            value={stats.total_bookings.toLocaleString()}
            sub={`${stats.total_tickets} vé đã cấp`}
            color="bg-sky-50 text-sky-600"
          />
          <StatCard
            icon={CalendarDays}
            label="Sự kiện"
            value={stats.events.total.toLocaleString()}
            sub={`${stats.events.published} đang mở · ${stats.events.completed} đã kết thúc`}
            color="bg-violet-50 text-violet-600"
          />
          <StatCard
            icon={Users}
            label="Khách hàng"
            value={stats.total_customers.toLocaleString()}
            color="bg-emerald-50 text-emerald-600"
          />
        </div>
      )}

      {/* Revenue chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-stone-900">Doanh thu theo tháng</h2>
            <p className="text-xs text-stone-400">Đơn vị: VNĐ</p>
          </div>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="rounded-xl border border-stone-200 px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <RevenueChart data={chartData} />
      </div>

      {/* Fill rates */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <PercentIcon className="h-4 w-4 text-stone-400" />
          <h2 className="font-semibold text-stone-900">Tỷ lệ lấp đầy ghế</h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map(i => <div key={i} className="h-8 animate-pulse rounded-lg bg-stone-100" />)}
          </div>
        ) : fillRates.length === 0 ? (
          <p className="text-sm text-stone-400">Chưa có dữ liệu</p>
        ) : (
          <div className="divide-y divide-stone-50">
            {fillRates.map(row => <FillRow key={row.id} row={row} />)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
