'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface StatDonutItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: StatDonutItem[];
  valueFormatter?: (v: number) => string;
}

export default function StatDonut({ data, valueFormatter }: Props) {
  const fmtV  = valueFormatter ?? ((v: number) => v.toLocaleString('vi-VN'));
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [fmtV(Number(v ?? 0)), String(name ?? '')]}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e7e5e4',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-2">
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100);
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="flex-1 truncate text-stone-600">{d.label}</span>
              <span className="tabular-nums text-stone-400">{fmtV(d.value)}</span>
              <span className="w-9 text-right font-semibold tabular-nums text-stone-700">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
