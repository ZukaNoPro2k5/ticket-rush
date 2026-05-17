'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle, ArrowRight, Calendar, CheckCircle2, Lightbulb,
  RefreshCw, Sparkles, TrendingUp, Users,
} from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion';
import api from '@/lib/api/client';

// ── Types ──────────────────────────────────────────────────────────────────

type Severity = 'opportunity' | 'warning' | 'critical' | 'info';
type Category = 'revenue' | 'events' | 'customers' | 'pricing' | 'operations';

interface Insight {
  id: string;
  severity: Severity;
  category: Category;
  title: string;
  description: string;
  metric?: { value: string; label: string };
  action?: { label: string; href: string };
}

interface InsightsResponse {
  insights: Insight[];
  summary: { total: number; critical: number; warning: number; opportunity: number };
  forecast: { avg_3_months: number; next_month_estimate: number; confidence: 'medium' | 'low' };
}

// ── Severity styling ───────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<Severity, {
  badge: string; icon: React.ComponentType<{ className?: string }>; label: string; ring: string;
}> = {
  critical:    { badge: 'bg-red-50 text-red-700',          icon: AlertTriangle, label: 'Cần xử lý',  ring: 'ring-red-100' },
  warning:     { badge: 'bg-amber-50 text-amber-700',      icon: AlertTriangle, label: 'Cảnh báo',    ring: 'ring-amber-100' },
  opportunity: { badge: 'bg-emerald-50 text-emerald-700',  icon: TrendingUp,    label: 'Cơ hội',      ring: 'ring-emerald-100' },
  info:        { badge: 'bg-stone-100 text-stone-600',     icon: Lightbulb,     label: 'Gợi ý',       ring: 'ring-stone-100' },
};

const CATEGORY_LABELS: Record<Category, string> = {
  revenue:    'Doanh thu',
  events:     'Sự kiện',
  customers:  'Khách hàng',
  pricing:    'Giá vé',
  operations: 'Vận hành',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' tỷ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'k';
  return n.toLocaleString('vi-VN');
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [data,    setData]    = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get<{ success: boolean; data: InsightsResponse }>('/admin/insights');
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const insights = data?.insights ?? [];
  const summary  = data?.summary;
  const forecast = data?.forecast;

  return (
    <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:border-stone-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới phân tích
        </button>
      </motion.div>

      {/* Summary panel */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold leading-snug text-stone-900">
          {loading ? (
            <span className="inline-block h-5 w-64 animate-pulse rounded bg-stone-100" />
          ) : summary && summary.total > 0 ? (
            <>
              Đã phát hiện <span className="text-amber-600">{summary.total}</span> điểm cần chú ý
              {summary.critical > 0 && (
                <> — bao gồm <span className="text-red-600">{summary.critical} cảnh báo nghiêm trọng</span></>
              )}.
            </>
          ) : (
            'Hệ thống đang vận hành ổn định — chưa phát hiện vấn đề nào cần xử lý ngay.'
          )}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
          {loading
            ? 'Đang phân tích dữ liệu vận hành 30 ngày gần đây…'
            : insights.length > 0
              ? 'Các đề xuất bên dưới được sinh tự động dựa trên rule-based analysis. Ưu tiên xử lý các mục cảnh báo đỏ trước.'
              : 'Tất cả chỉ số đang trong ngưỡng an toàn. Tiếp tục theo dõi và xem trang Phân tích để biết chi tiết.'}
        </p>
        {summary && summary.total > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
              <AlertTriangle className="h-3 w-3" /> {summary.critical} Nghiêm trọng
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <AlertTriangle className="h-3 w-3" /> {summary.warning} Cảnh báo
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" /> {summary.opportunity} Cơ hội
            </span>
          </div>
        )}
      </motion.div>

      {/* Forecast strip */}
      {forecast && (
        <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-stone-400">
              <Calendar className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Dự báo doanh thu tháng tới</p>
            </div>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-stone-900">
              {formatCurrency(forecast.next_month_estimate)} <span className="text-base text-stone-400">VNĐ</span>
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Dựa trên trung bình 3 tháng gần đây · độ tin cậy: <span className="font-semibold text-stone-700">
                {forecast.confidence === 'medium' ? 'trung bình' : 'thấp'}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-stone-400">
              <Users className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Trung bình 3 tháng gần đây</p>
            </div>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-stone-900">
              {formatCurrency(forecast.avg_3_months)} <span className="text-base text-stone-400">VNĐ</span>
            </p>
            <p className="mt-1 text-xs text-stone-500">Tham chiếu để dự báo</p>
          </div>
        </motion.div>
      )}

      {/* Insights list */}
      <motion.div variants={fadeUp}>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-lg font-bold text-stone-900">Đề xuất hành động</h2>
          {!loading && (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
              {insights.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-stone-100" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="mt-4 font-display text-lg font-bold text-stone-900">Mọi thứ đều ổn!</h3>
            <p className="mt-1 text-sm text-stone-500">Không có vấn đề hay cơ hội nào đáng chú ý ở thời điểm này.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Footer hint */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-4 text-center text-xs text-stone-500">
        <Sparkles className="mr-1 inline h-3 w-3 text-amber-500" />
        Báo cáo được sinh tự động dựa trên rule-based analysis — tham khảo
        {' '}<Link href="/admin/analytics" className="font-semibold text-amber-700 hover:underline">trang Phân tích</Link>{' '}
        để xem số liệu chi tiết.
      </motion.div>

    </motion.div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const sev  = SEVERITY_STYLES[insight.severity];
  const Icon = sev.icon;

  return (
    <div className={`group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-soft transition-all hover:border-stone-300 hover:shadow-md ring-1 ${sev.ring}`}>
      {/* Top: badges */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${sev.badge}`}>
            <Icon className="h-3 w-3" />
            {sev.label}
          </span>
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
            {CATEGORY_LABELS[insight.category]}
          </span>
        </div>
        {insight.metric && (
          <div className="text-right">
            <p className="font-display text-base font-bold tabular-nums text-stone-900">{insight.metric.value}</p>
            <p className="text-[10px] text-stone-400">{insight.metric.label}</p>
          </div>
        )}
      </div>

      {/* Title + description */}
      <h3 className="font-display font-bold leading-snug text-stone-900">{insight.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-stone-600">{insight.description}</p>

      {/* Action */}
      {insight.action && (
        <Link
          href={insight.action.href}
          className="mt-4 inline-flex items-center gap-1 self-start rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-stone-800"
        >
          {insight.action.label}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
