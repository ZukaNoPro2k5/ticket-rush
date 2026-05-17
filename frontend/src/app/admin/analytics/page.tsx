'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  ArrowDownRight, ArrowUpRight, LayoutGrid, BarChart2,
  AlertTriangle, TrendingUp, Repeat2, Clock, Tag, Zap,
  ChevronLeft, ChevronRight, Users,
} from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion';
import api from '@/lib/api/client';

const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse rounded-xl bg-stone-50" />,
});

const StatDonut = dynamic(() => import('@/components/admin/StatDonut'), {
  ssr: false,
  loading: () => <div className="h-[180px] animate-pulse rounded-xl bg-stone-50" />,
});

// ── Constants ──────────────────────────────────────────────────────────────

const NOW           = new Date();
const TODAY_DAY     = NOW.getDate();
const CURRENT_MONTH = NOW.getMonth() + 1;
const CURRENT_YEAR  = NOW.getFullYear();
const MIN_YEAR      = CURRENT_YEAR - 4;

const BASE_MONTH_LABELS = ['','T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const CAT_COLORS = ['#f43f5e','#0ea5e9','#10b981','#14b8a6','#8b5cf6','#d97706','#f97316','#78716c'];

const CATEGORY_VI: Record<string, string> = {
  music: 'Âm nhạc',
  arts: 'Nghệ thuật',
  sports: 'Thể thao',
  food: 'Ẩm thực',
  entertainment: 'Giải trí',
  workshop: 'Hội thảo',
  stage: 'Sân khấu',
  other: 'Khác',
};

const GENDER_VI: Record<string, string>     = { male: 'Nam', female: 'Nữ', other: 'Khác' };
const GENDER_COLORS: Record<string, string> = { male: '#3b82f6', female: '#ec4899', other: '#a8a29e' };
const AGE_ORDER = ['Under 18', '18-24', '25-34', '35-44', '45+'];
const AGE_COLORS = ['#d97706', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

// ── Types ──────────────────────────────────────────────────────────────────

interface RevenueRow  { month: number; revenue: number; bookings: number }
interface DayRow      { day: number;   revenue: number; bookings: number }
interface MonthDatum  { month: number; revenue: number; bookings: number }
interface CategoryStat  { category: string; bookings: number; revenue: number; event_count: number }
interface AdvancedStats {
  cancellation_rate: number; revenue_per_ticket: number; repeat_customer_pct: number;
  avg_lead_days: number; promo_usage_pct: number; discount_impact_pct: number; bookings_per_day: number;
}
interface GenderRow   { gender: string; count: number }
interface AgeRow      { age_group: string; count: number }
interface KpiCardData { label: string; value: string; prev: string; delta: number | null; hint: string }

// 'month': daily bars for selected month  (nav: <- Thang M . Y ->, click to pick)
// 'year':  12-month bars for selected year (nav: <- Nam Y ->, click to pick)
// 'years': 5-bar chart CURRENT_YEAR-4..CURRENT_YEAR — no navigator
type Period = 'month' | 'year' | 'years';

// ── Helpers ────────────────────────────────────────────────────────────────

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function toDays(rows: DayRow[], year: number, month: number): MonthDatum[] {
  const n = daysInMonth(year, month);
  return Array.from({ length: n }, (_, i) => {
    const d = i + 1;
    const r = rows.find(x => x.day === d);
    return { month: d, revenue: r?.revenue ?? 0, bookings: r?.bookings ?? 0 };
  });
}

function toMonths12(rows: RevenueRow[]): MonthDatum[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const r = rows.find(x => x.month === m);
    return { month: m, revenue: r?.revenue ?? 0, bookings: r?.bookings ?? 0 };
  });
}

function sumAll(data: MonthDatum[]) {
  return data.reduce(
    (a, d) => ({ revenue: a.revenue + d.revenue, bookings: a.bookings + d.bookings }),
    { revenue: 0, bookings: 0 },
  );
}

function changePct(cur: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'tr';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'k';
  return n.toLocaleString('vi-VN') + 'đ';
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-stone-400">—</span>;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-sm font-bold tabular-nums ${up ? 'text-emerald-600' : 'text-rose-500'}`}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {up ? '+' : ''}{pct}%
    </span>
  );
}

function CompCard({ card, loading }: { card: KpiCardData; loading?: boolean }) {
  if (loading) return <div className="h-[104px] animate-pulse rounded-2xl bg-stone-100" />;
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
  <p className="meta-text font-semibold uppercase tracking-widest">{card.label}</p>
  <p className="kpi-number mt-2">{card.value}</p>
      <div className="mt-1.5 flex items-center gap-2">
        <Delta pct={card.delta} />
        <span className="text-xs text-stone-400">{card.hint} · {card.prev}</span>
      </div>
    </div>
  );
}

function OpKpi({ icon: Icon, label, value, sub, accent, loading }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub: string; accent: string; loading?: boolean;
}) {
  if (loading) return <div className="h-[88px] animate-pulse rounded-2xl bg-stone-100" />;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">{label}</p>
        <p className="mt-0.5 text-xl font-bold tabular-nums text-stone-900">{value}</p>
        <p className="mt-0.5 truncate text-[11px] text-stone-400">{sub}</p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const [period,     setPeriod]     = useState<Period>('year');
  const [selMonth,   setSelMonth]   = useState(CURRENT_MONTH);
  const [selYear,    setSelYear]    = useState(CURRENT_YEAR);
  const [showPicker, setShowPicker] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // 5 years of monthly data: index 0 = selYear (newest), index 4 = selYear-4
  const [yearRevs,    setYearRevs]    = useState<MonthDatum[][]>(Array.from({ length: 5 }, () => []));
  const [yearLoading, setYearLoading] = useState(true);

  // Daily data for 'month' mode
  const [dayRevCur,  setDayRevCur]  = useState<DayRow[]>([]);
  const [dayRevPrev, setDayRevPrev] = useState<DayRow[]>([]);
  const [dayLoading, setDayLoading] = useState(false);

  // Demographics
  const [genderRows, setGenderRows] = useState<GenderRow[]>([]);
  const [ageRows,    setAgeRows]    = useState<AgeRow[]>([]);
  const [audLoading, setAudLoading] = useState(true);

  // Category
  const [catStats,   setCatStats]   = useState<CategoryStat[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  // Ops KPIs
  const [adv,        setAdv]        = useState<AdvancedStats | null>(null);
  const [advLoading, setAdvLoading] = useState(true);

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);

  // Fetch 5 years of monthly data when selYear changes
  useEffect(() => {
    setYearLoading(true);
    Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        api.get<{ success: boolean; data: RevenueRow[] }>(`/admin/revenue?year=${selYear - i}`),
      ),
    )
      .then(results => setYearRevs(results.map(r => toMonths12(r.data.data ?? []))))
      .catch(() => {})
      .finally(() => setYearLoading(false));
  }, [selYear]);

  // Daily data only in 'month' mode
  useEffect(() => {
    if (period !== 'month') return;
    setDayLoading(true);
    Promise.all([
      api.get<{ success: boolean; data: DayRow[] }>(`/admin/revenue?year=${selYear}&month=${selMonth}`),
      api.get<{ success: boolean; data: DayRow[] }>(`/admin/revenue?year=${selYear - 1}&month=${selMonth}`),
    ])
      .then(([cur, prev]) => {
        setDayRevCur(cur.data.data ?? []);
        setDayRevPrev(prev.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => setDayLoading(false));
  }, [period, selYear, selMonth]);

  // Audience — load once
  useEffect(() => {
    setAudLoading(true);
    api.get<{ success: boolean; data: { gender: GenderRow[]; age: AgeRow[] } }>('/admin/audience')
      .then(res => {
        setGenderRows(res.data.data?.gender ?? []);
        setAgeRows(res.data.data?.age ?? []);
      })
      .catch(() => {})
      .finally(() => setAudLoading(false));
  }, []);

  // Category — load once
  useEffect(() => {
    setCatLoading(true);
    api.get<{ success: boolean; data: CategoryStat[] }>('/admin/category-stats')
      .then(res => setCatStats(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  // Ops KPIs — load once
  useEffect(() => {
    setAdvLoading(true);
    api.get<{ success: boolean; data: AdvancedStats }>('/admin/advanced-stats')
      .then(res => setAdv(res.data.data))
      .catch(() => {})
      .finally(() => setAdvLoading(false));
  }, []);

  // ── Period switch ─────────────────────────────────────────────────────────

  const handlePeriod = useCallback((p: Period) => {
    if (p === 'years') setSelYear(CURRENT_YEAR);
    setPeriod(p);
    setShowPicker(false);
  }, []);

  // ── Navigator bounds ──────────────────────────────────────────────────────

  const atMax = useMemo(() => {
    if (period === 'month') return selYear === CURRENT_YEAR && selMonth === CURRENT_MONTH;
    return selYear === CURRENT_YEAR;
  }, [period, selYear, selMonth]);

  const atMin = useMemo(() => {
    if (period === 'month') return selYear <= MIN_YEAR && selMonth === 1;
    return selYear <= MIN_YEAR;
  }, [period, selYear, selMonth]);

  const handlePrev = useCallback(() => {
    if (period === 'month') {
      if (selMonth > 1) setSelMonth(m => m - 1);
      else { setSelYear(y => y - 1); setSelMonth(12); }
    } else if (period === 'year') {
      setSelYear(y => Math.max(y - 1, MIN_YEAR));
    }
    setShowPicker(false);
  }, [period, selMonth]);

  const handleNext = useCallback(() => {
    if (period === 'month') {
      const maxM = selYear < CURRENT_YEAR ? 12 : CURRENT_MONTH;
      if (selMonth < maxM) setSelMonth(m => m + 1);
      else if (selYear < CURRENT_YEAR) { setSelYear(y => y + 1); setSelMonth(1); }
    } else if (period === 'year') {
      setSelYear(y => Math.min(y + 1, CURRENT_YEAR));
    }
    setShowPicker(false);
  }, [period, selMonth, selYear]);

  const navLabel = period === 'month' ? `Tháng ${selMonth} · ${selYear}` : `Năm ${selYear}`;

  // ── KPI Cards ─────────────────────────────────────────────────────────────

  const kpiCards = useMemo((): KpiCardData[] => {
    const cur12  = yearRevs[0] ?? [];
    const prev12 = yearRevs[1] ?? [];

    if (period === 'month') {
      const curM  = cur12[selMonth - 1]  ?? { month: selMonth, revenue: 0, bookings: 0 };
      const prevM = selMonth > 1
        ? (cur12[selMonth - 2]  ?? { month: 0, revenue: 0, bookings: 0 })
        : (prev12[11]           ?? { month: 0, revenue: 0, bookings: 0 });
      const prevY    = prev12[selMonth - 1] ?? { month: selMonth, revenue: 0, bookings: 0 };
      const isCurM   = selYear === CURRENT_YEAR && selMonth === CURRENT_MONTH;
      const elapsed  = isCurM ? TODAY_DAY : daysInMonth(selYear, selMonth);
      const avgDaily = elapsed > 0 ? Math.round(curM.revenue / elapsed) : 0;
      const prevHint = selMonth > 1 ? `vs T${selMonth - 1}/${selYear}` : `vs T12/${selYear - 1}`;
      return [
        { label: `Doanh thu T${selMonth}/${selYear}`,   value: fmt(curM.revenue),                    prev: fmt(prevM.revenue),                    delta: changePct(curM.revenue, prevM.revenue),   hint: prevHint },
        { label: `Đơn đặt vé T${selMonth}/${selYear}`,  value: curM.bookings.toLocaleString('vi-VN'), prev: prevM.bookings.toLocaleString('vi-VN'), delta: changePct(curM.bookings, prevM.bookings), hint: prevHint },
        { label: `So với cùng kỳ ${selYear - 1}`,        value: fmt(curM.revenue),                    prev: fmt(prevY.revenue),                    delta: changePct(curM.revenue, prevY.revenue),   hint: `T${selMonth}/${selYear - 1}` },
        { label: 'DT trung bình / ngày',                value: fmt(avgDaily),                        prev: '—',                                   delta: null,                                     hint: `trên ${elapsed} ngày` },
      ];
    }

    if (period === 'years') {
      const years5 = yearRevs.map((yr, i) => ({ year: CURRENT_YEAR - i, ...sumAll(yr) }));
      const curYr  = years5[0] ?? { year: CURRENT_YEAR, revenue: 0, bookings: 0 };
      const prevYr = years5[1] ?? { year: CURRENT_YEAR - 1, revenue: 0, bookings: 0 };
      const bestYr = [...years5].sort((a, b) => b.revenue - a.revenue)[0] ?? curYr;
      const total5 = years5.reduce((s, y) => s + y.revenue, 0);
      return [
        { label: `Tổng ${CURRENT_YEAR - 4}—${CURRENT_YEAR}`,  value: fmt(total5),                              prev: '—',                               delta: null,                                              hint: 'tổng 5 năm' },
        { label: `Doanh thu ${CURRENT_YEAR}`,                  value: fmt(curYr.revenue),                      prev: fmt(prevYr.revenue),               delta: changePct(curYr.revenue, prevYr.revenue),          hint: `vs ${CURRENT_YEAR - 1}` },
        { label: 'Năm doanh thu cao nhất',                     value: `${bestYr.year}: ${fmt(bestYr.revenue)}`, prev: '—',                              delta: null,                                              hint: '5 năm gần nhất' },
        { label: `Đơn đặt vé ${CURRENT_YEAR}`,                 value: curYr.bookings.toLocaleString('vi-VN'),  prev: prevYr.bookings.toLocaleString('vi-VN'), delta: changePct(curYr.bookings, prevYr.bookings),   hint: `vs ${CURRENT_YEAR - 1}` },
      ];
    }

    // year mode
    const curY  = sumAll(cur12);
    const prevY = sumAll(prev12);
    const bestM = cur12.reduce((b, d) => d.revenue > b.revenue ? d : b, { month: 1, revenue: 0, bookings: 0 });
    const aovCur  = curY.bookings  > 0 ? Math.round(curY.revenue  / curY.bookings)  : 0;
    const aovPrev = prevY.bookings > 0 ? Math.round(prevY.revenue / prevY.bookings) : 0;
    return [
      { label: `Tổng doanh thu ${selYear}`,   value: fmt(curY.revenue),                    prev: fmt(prevY.revenue),                    delta: changePct(curY.revenue, prevY.revenue),   hint: `vs ${selYear - 1}` },
      { label: `Tổng đơn đặt vé ${selYear}`,  value: curY.bookings.toLocaleString('vi-VN'), prev: prevY.bookings.toLocaleString('vi-VN'), delta: changePct(curY.bookings, prevY.bookings), hint: `vs ${selYear - 1}` },
      { label: `Tháng cao điểm ${selYear}`,   value: bestM.revenue > 0 ? `T${bestM.month}: ${fmt(bestM.revenue)}` : '—', prev: '—', delta: null, hint: 'doanh thu cao nhất' },
      { label: 'Giá trị đơn TB (AOV)',         value: fmt(aovCur),                          prev: fmt(aovPrev),                          delta: changePct(aovCur, aovPrev),               hint: `vs ${selYear - 1}` },
    ];
  }, [period, selMonth, selYear, yearRevs]);

  // ── Chart config ──────────────────────────────────────────────────────────

  const chartConfig = useMemo(() => {
    const cur12     = yearRevs[0] ?? [];
    const prev12    = yearRevs[1] ?? [];
    const isCurYear = selYear === CURRENT_YEAR;

    if (period === 'month') {
      const data     = toDays(dayRevCur,  selYear,     selMonth);
      const compData = toDays(dayRevPrev, selYear - 1, selMonth);
      const n        = daysInMonth(selYear, selMonth);
      const labels   = ['', ...Array.from({ length: n }, (_, i) => String(i + 1))];
      const isCurM   = isCurYear && selMonth === CURRENT_MONTH;
      return {
        data, compData, labels,
        activeIndex: isCurM ? TODAY_DAY - 1 : -1,
        title:    `Doanh thu từng ngày · Tháng ${selMonth}/${selYear}`,
        subtitle: `${n} ngày · Cột = ${selYear} · Nét đứt = T${selMonth}/${selYear - 1}`,
        compLabel: `T${selMonth}/${selYear - 1}`,
      };
    }

    if (period === 'years') {
      const data   = [...yearRevs].reverse().map((yr, i) => ({ month: i + 1, ...sumAll(yr) }));
      const labels = ['', ...Array.from({ length: 5 }, (_, i) => String(CURRENT_YEAR - 4 + i))];
      return {
        data, compData: undefined as typeof data | undefined, labels,
        activeIndex: 4,
        title:    `So sánh doanh thu · ${CURRENT_YEAR - 4} — ${CURRENT_YEAR}`,
        subtitle: `Tổng doanh thu mỗi năm · Cột ${CURRENT_YEAR} được tô đậm`,
        compLabel: undefined as string | undefined,
      };
    }

    // year mode: always full T1-T12 (future months = 0, bar still drawn)
    return {
      data: cur12, compData: prev12 as typeof cur12 | undefined, labels: BASE_MONTH_LABELS,
      activeIndex: isCurYear ? CURRENT_MONTH - 1 : -1,
      title:    `Doanh thu theo tháng · ${selYear}`,
      subtitle: `T1–T12 · Cột = ${selYear} · Nét đứt = ${selYear - 1}`,
      compLabel: String(selYear - 1),
    };
  }, [period, selMonth, selYear, dayRevCur, dayRevPrev, yearRevs]);

  // ── Donut data ────────────────────────────────────────────────────────────

  const catDonutData = useMemo(() =>
    catStats.map((c, i) => ({
      label: CATEGORY_VI[c.category] ?? c.category,
      value: c.revenue,
      color: CAT_COLORS[i % CAT_COLORS.length],
    })), [catStats]);

  const genderDonutData = useMemo(() =>
    ['male', 'female', 'other'].map(g => ({
      label: GENDER_VI[g] ?? g,
      value: genderRows.find(r => r.gender === g)?.count ?? 0,
      color: GENDER_COLORS[g] ?? '#a8a29e',
    })), [genderRows]);

  const ageDonutData = useMemo(() =>
    AGE_ORDER.map((ag, i) => ({
      label: ag,
      value: ageRows.find(r => r.age_group === ag)?.count ?? 0,
      color: AGE_COLORS[i],
    })), [ageRows]);

  const isRevLoading = period === 'month' ? dayLoading : yearLoading;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-6">

      {/* ── Header + Controls ── */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-h-10">

          {/* Navigator — hidden in 'years' mode */}
          {period !== 'years' && (
            <div ref={navRef} className="relative flex items-center gap-0.5 rounded-xl border border-stone-200 bg-white px-1.5 py-1 shadow-sm">
              <button
                onClick={handlePrev}
                disabled={atMin}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowPicker(v => !v)}
                className="min-w-[148px] rounded-lg px-2 py-0.5 text-center text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 active:bg-stone-100"
              >
                {navLabel}
              </button>
              <button
                onClick={handleNext}
                disabled={atMax}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {/* Picker dropdown */}
              {showPicker && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl" style={{ minWidth: 224 }}>
                  {period === 'month' && (
                    <>
                      {/* Year row inside picker */}
                      <div className="mb-3 flex items-center justify-between">
                        <button
                          onClick={() => setSelYear(y => Math.max(y - 1, MIN_YEAR))}
                          disabled={selYear <= MIN_YEAR}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-bold text-stone-800">{selYear}</span>
                        <button
                          onClick={() => setSelYear(y => Math.min(y + 1, CURRENT_YEAR))}
                          disabled={selYear >= CURRENT_YEAR}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 disabled:opacity-30"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {/* Month grid 4x3 */}
                      <div className="grid grid-cols-4 gap-1">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                          const disabled = selYear === CURRENT_YEAR && m > CURRENT_MONTH;
                          const active   = m === selMonth;
                          return (
                            <button
                              key={m}
                              disabled={disabled}
                              onClick={() => { setSelMonth(m); setShowPicker(false); }}
                              className={`rounded-xl py-1.5 text-xs font-semibold transition-all disabled:opacity-30 ${
                                active
                                  ? 'bg-stone-900 text-white'
                                  : 'text-stone-500 hover:bg-stone-100'
                              }`}
                            >
                              T{m}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {period === 'year' && (
                    <div className="flex flex-col gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i).reverse().map(y => (
                        <button
                          key={y}
                          onClick={() => { setSelYear(y); setShowPicker(false); }}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                            y === selYear
                              ? 'bg-stone-900 text-white'
                              : 'text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          <span>{y}</span>
                          {y === CURRENT_YEAR && (
                            <span className={`text-[10px] font-normal ${y === selYear ? 'text-white/60' : 'text-stone-400'}`}>
                              Nam nay
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Period toggle — 3 modes */}
        <div className="flex items-center justify-self-start gap-1 rounded-2xl border border-stone-200 bg-stone-50 p-1 sm:justify-self-end">
            {(['month', 'year', 'years'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => handlePeriod(p)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  period === p ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {p === 'month' ? 'Theo tháng' : p === 'year' ? 'Theo năm' : 'Các năm gần đây'}
              </button>
            ))}
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {yearLoading
            ? [0, 1, 2, 3].map(i => <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-stone-100" />)
            : kpiCards.map((card, i) => <CompCard key={i} card={card} />)
          }
        </div>
      </motion.div>

      {/* ── Main Revenue Chart ── */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
          <div className="mb-5">
            <h2 className="section-title">{chartConfig.title}</h2>
            <p className="meta-text mt-0.5">
              {chartConfig.subtitle}
              {period !== 'years' && ' · Cột = doanh thu (trái) · Đường liền = số đơn (phải)'}
              {chartConfig.compLabel ? ` · Nét đứt = ${chartConfig.compLabel}` : ''}
            </p>
          </div>
          {isRevLoading
            ? <div className="h-[300px] animate-pulse rounded-xl bg-stone-50" />
            : <RevenueChart
                data={chartConfig.data}
                monthLabels={chartConfig.labels}
                activeIndex={chartConfig.activeIndex}
                compData={chartConfig.compData}
                compLabel={chartConfig.compLabel}
                chartHeight={300}
              />
          }
        </div>
      </motion.div>

      {/* ── Operational KPIs ── */}
      <motion.div variants={fadeUp}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-stone-400" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">
            Chỉ số vận hành nghiệp vụ
          </span>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
            Luôn cập nhật hiện tại
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <OpKpi icon={AlertTriangle} label="Tỷ lệ huỷ vé"       value={adv ? `${adv.cancellation_rate}%`    : '—'} sub="30 ngày gần nhất"     accent="bg-rose-50 text-rose-500"       loading={advLoading} />
          <OpKpi icon={TrendingUp}   label="Doanh thu / vé"     value={adv ? fmt(adv.revenue_per_ticket)    : '—'} sub="Yield mỗi vé bán ra"  accent="bg-amber-50 text-amber-600"     loading={advLoading} />
          <OpKpi icon={Repeat2}      label="Khách quay lại"     value={adv ? `${adv.repeat_customer_pct}%` : '—'} sub="Đặt vé ≥ 2 lần"      accent="bg-emerald-50 text-emerald-600" loading={advLoading} />
          <OpKpi icon={Clock}        label="Mua trước TB"       value={adv ? `${adv.avg_lead_days} ngày`   : '—'} sub="Trước ngày sự kiện"   accent="bg-sky-50 text-sky-500"         loading={advLoading} />
          <OpKpi icon={Tag}          label="Dùng mã KM"         value={adv ? `${adv.promo_usage_pct}%`     : '—'} sub="Đơn có khuyến mãi"    accent="bg-violet-50 text-violet-500"   loading={advLoading} />
          <OpKpi icon={Zap}          label="Tốc độ bán / ngày"  value={adv ? `${adv.bookings_per_day}`     : '—'} sub="Đơn/ngày tháng này"   accent="bg-stone-100 text-stone-600"    loading={advLoading} />
        </div>
      </motion.div>

      {/* ── 3 Donut Charts — equal grid ── */}
      <motion.div variants={fadeUp}>
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Category */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <div className="mb-1 flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-stone-400" />
              <h2 className="section-title">Danh mục</h2>
            </div>
            <p className="mb-4 meta-text">Tỷ trọng doanh thu theo danh mục</p>
            {catLoading
              ? <div className="h-[180px] animate-pulse rounded-xl bg-stone-50" />
              : catDonutData.length === 0
                ? <p className="py-12 text-center text-sm text-stone-400">Chua co du lieu</p>
                : <StatDonut data={catDonutData} valueFormatter={fmt} />
            }
          </div>

          {/* Gender */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <div className="mb-1 flex items-center gap-2">
              <Users className="h-4 w-4 text-stone-400" />
              <h2 className="section-title">Giới tính</h2>
            </div>
            <p className="mb-4 meta-text">Phân bố khách hàng theo giới tính</p>
            {audLoading
              ? <div className="h-[180px] animate-pulse rounded-xl bg-stone-50" />
              : genderDonutData.every(d => d.value === 0)
                ? <p className="py-12 text-center text-sm text-stone-400">Chua co du lieu</p>
                : <StatDonut data={genderDonutData} />
            }
          </div>

          {/* Age */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <div className="mb-1 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-stone-400" />
              <h2 className="section-title">Độ tuổi</h2>
            </div>
            <p className="mb-4 meta-text">Phân bố khách hàng theo nhóm tuổi</p>
            {audLoading
              ? <div className="h-[180px] animate-pulse rounded-xl bg-stone-50" />
              : ageDonutData.every(d => d.value === 0)
                ? <p className="py-12 text-center text-sm text-stone-400">Chua co du lieu</p>
                : <StatDonut data={ageDonutData} />
            }
          </div>

        </div>
      </motion.div>

    </motion.div>
  );
}
