'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle, ArrowRight, Calendar, CheckCircle2, Download,
  FileText, Lightbulb, RefreshCw, Sparkles, TrendingUp, Users,
} from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion';
import api from '@/lib/api/client';

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

interface BusinessReport {
  title: string;
  generated_at: string;
  model: string;
  source: 'ai' | 'fallback';
  executive_summary: string;
  highlights: string[];
  sections: { title: string; body: string }[];
  disclaimer: string;
}

const SEVERITY_STYLES: Record<Severity, {
  badge: string; icon: React.ComponentType<{ className?: string }>; label: string; ring: string;
}> = {
  critical:    { badge: 'bg-red-50 text-red-700',         icon: AlertTriangle, label: 'Cần xử lý', ring: 'ring-red-100' },
  warning:     { badge: 'bg-amber-50 text-amber-700',     icon: AlertTriangle, label: 'Cảnh báo',   ring: 'ring-amber-100' },
  opportunity: { badge: 'bg-emerald-50 text-emerald-700', icon: TrendingUp,    label: 'Cơ hội',     ring: 'ring-emerald-100' },
  info:        { badge: 'bg-stone-100 text-stone-600',    icon: Lightbulb,     label: 'Gợi ý',      ring: 'ring-stone-100' },
};

const CATEGORY_LABELS: Record<Category, string> = {
  revenue: 'Doanh thu',
  events: 'Sự kiện',
  customers: 'Khách hàng',
  pricing: 'Giá vé',
  operations: 'Vận hành',
};

function formatCurrency(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' tr';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
  return n.toLocaleString('vi-VN');
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function printReport(report: BusinessReport) {
  const popup = window.open('', '_blank', 'width=900,height=800');
  if (!popup) return;
  const date = new Date(report.generated_at).toLocaleString('vi-VN');
  popup.document.write(`<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(report.title)}</title>
  <style>
    @page { margin: 18mm; }
    body { font-family: Arial, sans-serif; color: #1c1917; line-height: 1.55; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    h2 { font-size: 16px; margin: 22px 0 8px; }
    p, li { font-size: 12px; }
    .meta { color: #78716c; margin-bottom: 22px; }
    .summary { border: 1px solid #e7e5e4; background: #fffbeb; padding: 14px 16px; border-radius: 12px; }
    .muted { color: #78716c; }
  </style>
</head>
<body>
  <h1>${escapeHtml(report.title)}</h1>
  <p class="meta">Ngày tạo: ${escapeHtml(date)} · Nguồn: ${escapeHtml(report.source === 'ai' ? report.model : 'bản dựng dự phòng')}</p>
  <div class="summary"><strong>Tóm tắt điều hành</strong><p>${escapeHtml(report.executive_summary)}</p></div>
  <h2>Điểm nhấn</h2>
  <ul>${report.highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
  ${report.sections.map((section) => `<h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p>`).join('')}
  <p class="muted">${escapeHtml(report.disclaimer)}</p>
</body>
</html>`);
  popup.document.close();
  popup.focus();
  popup.print();
}

export default function AdminReportsPage() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [report, setReport] = useState<BusinessReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setReportLoading(true);
    try {
      const [insightsRes, reportRes] = await Promise.all([
        api.get<{ success: boolean; data: InsightsResponse }>('/admin/insights'),
        api.get<{ success: boolean; data: BusinessReport }>('/admin/business-report'),
      ]);
      setData(insightsRes.data.data);
      setReport(reportRes.data.data);
    } catch {
      setData(null);
      setReport(null);
    } finally {
      setLoading(false);
      setReportLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const insights = data?.insights ?? [];
  const summary = data?.summary;
  const forecast = data?.forecast;

  return (
    <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Báo cáo tự động</h1>
          <p className="mt-1 text-sm text-stone-500">Phân tích điều hành và bản báo cáo kinh tế tham khảo cho ban tổ chức.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => report && printReport(report)}
            disabled={!report || reportLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition-colors hover:border-stone-300 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Xuất PDF
          </button>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới báo cáo
          </button>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <Sparkles className="h-3 w-3" />
              {report?.source === 'ai' ? `AI · ${report.model}` : 'Bản dựng dự phòng'}
            </span>
            {report && (
              <span className="text-xs text-stone-400">
                {new Date(report.generated_at).toLocaleString('vi-VN')}
              </span>
            )}
          </div>
          <h2 className="font-display text-xl font-bold text-stone-900">
            {reportLoading ? <span className="inline-block h-6 w-64 animate-pulse rounded bg-stone-100" /> : report?.title}
          </h2>
          {reportLoading ? (
            <div className="mt-5 space-y-3">
              <div className="h-20 animate-pulse rounded-xl bg-stone-100" />
              <div className="h-24 animate-pulse rounded-xl bg-stone-100" />
            </div>
          ) : report ? (
            <>
              <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700">Tóm tắt điều hành</p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{report.executive_summary}</p>
              </div>
              <div className="mt-5 space-y-5">
                {report.sections.map((section) => (
                  <article key={section.title}>
                    <h3 className="font-display text-base font-bold text-stone-900">{section.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{section.body}</p>
                  </article>
                ))}
              </div>
              <p className="mt-5 border-t border-stone-100 pt-4 text-xs text-stone-400">{report.disclaimer}</p>
            </>
          ) : (
            <p className="mt-4 text-sm text-stone-500">Chưa dựng được báo cáo. Thử làm mới lại sau.</p>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2 text-stone-400">
              <FileText className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Điểm nhấn</p>
            </div>
            <div className="mt-4 space-y-3">
              {reportLoading
                ? [0, 1, 2, 3].map((item) => <div key={item} className="h-10 animate-pulse rounded-xl bg-stone-100" />)
                : report?.highlights.map((item) => (
                  <p key={item} className="rounded-xl bg-stone-50 px-3 py-2 text-sm leading-relaxed text-stone-600">{item}</p>
                ))}
            </div>
          </div>

          {forecast && (
            <>
              <ForecastCard
                icon={Calendar}
                label="Dự báo tháng tới"
                value={`${formatCurrency(forecast.next_month_estimate)} VNĐ`}
                sub={`Độ tin cậy: ${forecast.confidence === 'medium' ? 'trung bình' : 'thấp'}`}
              />
              <ForecastCard
                icon={Users}
                label="TB 3 tháng gần đây"
                value={`${formatCurrency(forecast.avg_3_months)} VNĐ`}
                sub="Mốc tham chiếu"
              />
            </>
          )}
        </aside>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold leading-snug text-stone-900">
          {loading ? (
            <span className="inline-block h-5 w-64 animate-pulse rounded bg-stone-100" />
          ) : summary && summary.total > 0 ? (
            <>
              Đã phát hiện <span className="text-amber-600">{summary.total}</span> điểm cần chú ý
              {summary.critical > 0 && (
                <> , gồm <span className="text-red-600">{summary.critical} cảnh báo nghiêm trọng</span></>
              )}.
            </>
          ) : (
            'Hệ thống đang vận hành ổn định, chưa có vấn đề cần xử lý ngay.'
          )}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-stone-500">
          {loading
            ? 'Đang phân tích dữ liệu vận hành 30 ngày gần đây…'
            : insights.length > 0
              ? 'Các cảnh báo bên dưới được tính từ dữ liệu thật và nên được đọc cùng bản báo cáo kinh tế phía trên.'
              : 'Tất cả chỉ số đang trong ngưỡng an toàn. Tiếp tục theo dõi trang Phân tích để xem số liệu chi tiết.'}
        </p>
      </motion.div>

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
            {[...Array(4)].map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-stone-100" />)}
          </div>
        ) : insights.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h3 className="mt-4 font-display text-lg font-bold text-stone-900">Mọi thứ đều ổn</h3>
            <p className="mt-1 text-sm text-stone-500">Không có vấn đề hay cơ hội nào nổi bật ở thời điểm này.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
          </div>
        )}
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-4 text-center text-xs text-stone-500">
        <Sparkles className="mr-1 inline h-3 w-3 text-amber-500" />
        Báo cáo AI là tài liệu tham khảo, còn số liệu nền nằm tại{' '}
        <Link href="/admin/analytics" className="font-semibold text-amber-700 hover:underline">trang Phân tích</Link>.
      </motion.div>
    </motion.div>
  );
}

function ForecastCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 text-stone-400">
        <Icon className="h-4 w-4" />
        <p className="text-[11px] font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums text-stone-900">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{sub}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const sev = SEVERITY_STYLES[insight.severity];
  const Icon = sev.icon;
  return (
    <div className={`group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-soft ring-1 transition-all hover:border-stone-300 hover:shadow-md ${sev.ring}`}>
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
      <h3 className="font-display font-bold leading-snug text-stone-900">{insight.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-stone-600">{insight.description}</p>
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
