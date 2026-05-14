'use client';

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from 'recharts';

const MONTH_LABELS = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

function fmtYAxis(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(0) + ' tỷ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(0) + ' tr';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'k';
  return String(n);
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷđ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' trđ';
  return n.toLocaleString('vi-VN') + 'đ';
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number }>;
  label?: number;
  monthLabels?: string[];
  compLabel?: string;
}

function RevenueTooltip({ active, payload, label, monthLabels, compLabel }: TooltipProps) {
  const labels = monthLabels ?? MONTH_LABELS;
  if (!active || !payload?.length) return null;
  const rev     = payload.find(p => p.dataKey === 'revenue')?.value     ?? 0;
  const book    = payload.find(p => p.dataKey === 'bookings')?.value    ?? 0;
  const compRev = payload.find(p => p.dataKey === 'compRevenue')?.value;
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs shadow-lg">
      <p className="mb-2 font-bold text-stone-800">{labels[label ?? 0] ?? label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-stone-500">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />
            Doanh thu
          </span>
          <span className="font-bold tabular-nums text-stone-900">{fmtMoney(rev)}</span>
        </div>
        {compRev != null && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-stone-400">
              <span className="inline-block h-0 w-3 border-t-2 border-dashed border-stone-400" />
              {compLabel ?? 'Kỳ trước'}
            </span>
            <span className="tabular-nums text-stone-500">{fmtMoney(compRev)}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-stone-500">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-stone-400" />
            Đơn đặt vé
          </span>
          <span className="font-bold tabular-nums text-stone-900">{book.toLocaleString()} đơn</span>
        </div>
      </div>
    </div>
  );
}

function CustomLegend({ compLabel }: { compLabel?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4 pb-1 text-xs text-stone-500">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />
        Doanh thu (trục trái)
      </span>
      {compLabel && (
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-4 border-t-2 border-dashed border-stone-400" />
          {compLabel}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-stone-400 bg-white" />
        Đơn đặt vé (trục phải)
      </span>
    </div>
  );
}

export interface ChartDatum {
  month: number;
  revenue: number;
  bookings: number;
}

export function RevenueChart({ data, monthLabels, activeIndex = -1, compData, compLabel, chartHeight = 260 }: {
  data: ChartDatum[];
  monthLabels?: string[];
  activeIndex?: number;
  compData?: ChartDatum[];
  compLabel?: string;
  chartHeight?: number;
}) {
  const labels = monthLabels ?? MONTH_LABELS;
  const merged = compData
    ? data.map((d, i) => ({ ...d, compRevenue: compData[i]?.revenue ?? 0 }))
    : data;
  return (
    <div>
      <CustomLegend compLabel={compLabel} />
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={merged} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
          <XAxis
            dataKey="month"
            tickFormatter={(v: number) => labels[v] ?? String(v)}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#a8a29e' }}
          />
          <YAxis
            yAxisId="rev"
            orientation="left"
            tickFormatter={fmtYAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#a8a29e' }}
            width={48}
          />
          <YAxis
            yAxisId="book"
            orientation="right"
            tickFormatter={(v: number) => v === 0 ? '' : String(v)}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#d6d3d1' }}
            width={32}
          />
          <Tooltip
            content={<RevenueTooltip monthLabels={labels} compLabel={compLabel} />}
            cursor={{ fill: '#fafaf9' }}
          />
          <Bar yAxisId="rev" dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={activeIndex === i ? '#d97706' : activeIndex >= 0 ? '#fde68a' : '#fcd34d'}
              />
            ))}
          </Bar>
          <Line
            yAxisId="book"
            dataKey="bookings"
            stroke="#a8a29e"
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#a8a29e', stroke: '#fff', strokeWidth: 1.5 }}
            activeDot={{ r: 4, fill: '#57534e', stroke: '#fff', strokeWidth: 2 }}
            type="monotone"
          />
          {compData && (
            <Line
              yAxisId="rev"
              dataKey="compRevenue"
              stroke="#a8a29e"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              type="monotone"
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RevenueChart;
