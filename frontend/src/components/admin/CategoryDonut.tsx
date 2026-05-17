'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryStat {
  category: string;
  bookings: number;
  revenue: number;
  event_count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  music: 'Âm nhạc',
  arts: 'Nghệ thuật',
  sports: 'Thể thao',
  food: 'Ẩm thực',
  entertainment: 'Giải trí',
  workshop: 'Hội thảo',
  stage: 'Sân khấu',
  other: 'Khác',
};

const PALETTE = ['#f43f5e', '#0ea5e9', '#10b981', '#14b8a6', '#8b5cf6', '#d97706', '#f97316', '#78716c'];

function fmt(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'tr';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'k';
  return n.toLocaleString('vi-VN') + 'đ';
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: CategoryStat & { fill: string };
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-stone-100 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-stone-800">{CATEGORY_LABELS[d.category] ?? d.category}</p>
      <p className="text-stone-500">{d.bookings} đơn · {fmt(d.revenue)}</p>
    </div>
  );
}

export default function CategoryDonut({ data }: { data: CategoryStat[] }) {
  const total = data.reduce((s, d) => s + d.revenue, 0) || 1;
  const chartData = data.map((d, i) => ({
    ...d,
    fill: PALETTE[i % PALETTE.length],
    label: CATEGORY_LABELS[d.category] ?? d.category,
  }));

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            dataKey="revenue"
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-1.5">
        {chartData.map((d) => {
          const pct = Math.round((d.revenue / total) * 100);
          return (
            <div key={d.category} className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.fill }} />
              <span className="min-w-0 flex-1 truncate text-xs text-stone-600">{d.label}</span>
              <span className="text-xs font-semibold tabular-nums text-stone-800">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
