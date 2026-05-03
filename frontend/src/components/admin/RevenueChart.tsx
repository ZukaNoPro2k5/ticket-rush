'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const MONTH_LABELS = ['', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

function formatMoney(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' tr';
  return n.toLocaleString('vi-VN') + 'đ';
}

function RevenueTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs shadow-lift">
      <p className="mb-1 font-semibold text-stone-700">{MONTH_LABELS[label ?? 0]}</p>
      <p className="text-amber-600">{formatMoney(payload[0].value)}</p>
    </div>
  );
}

export interface ChartDatum {
  month: number;
  revenue: number;
  bookings: number;
}

export function RevenueChart({ data }: { data: ChartDatum[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="month"
          tickFormatter={(v: number) => MONTH_LABELS[v]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#a8a29e' }}
        />
        <YAxis hide />
        <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f5f5f4' }} />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell
              key={d.month}
              fill={d.revenue === maxRevenue ? '#f59e0b' : '#e7e5e4'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Default export so `next/dynamic` can pick it up cleanly.
export default RevenueChart;
