'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  CITIES,
  DEFAULT_PRICE_MAX,
  TIME_RANGES,
  type TimeRangeKey,
} from '@/lib/utils/eventsFilters';

function formatVnd(value: number): string {
  return `${value.toLocaleString('vi-VN')}đ`;
}

interface Props {
  stagedTime: TimeRangeKey;
  stagedCity: string;
  stagedPriceMax: number;
  pendingChanges: number;
  activeFilterCount: number;
  onStagedTimeChange: (v: TimeRangeKey) => void;
  onStagedCityChange: (v: string) => void;
  onStagedPriceMaxChange: (v: number) => void;
  onApply: () => void;
  onDiscard: () => void;
  onResetAll: () => void;
}

export function EventsFilterSidebar({
  stagedTime,
  stagedCity,
  stagedPriceMax,
  pendingChanges,
  activeFilterCount,
  onStagedTimeChange,
  onStagedCityChange,
  onStagedPriceMaxChange,
  onApply,
  onDiscard,
  onResetAll,
}: Props) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[calc(80px+60px)] space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-stone-900">Bộ lọc nâng cao</h3>
          {activeFilterCount > 0 && (
            <button onClick={onResetAll} className="text-xs font-medium text-amber-700 hover:text-amber-800">
              Xóa tất cả
            </button>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
            Thời gian
          </label>
          <div className="space-y-1.5">
            {TIME_RANGES.map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="time"
                  checked={stagedTime === t.key}
                  onChange={() => onStagedTimeChange(t.key)}
                  className="accent-amber-500"
                />
                <span className="text-stone-700">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
            Thành phố
          </label>
          <div className="relative">
            <select
              value={stagedCity}
              onChange={(e) => onStagedCityChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-stone-200 bg-white px-3 py-2 pr-8 text-sm focus:border-amber-500 focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Giá tối đa
            </label>
            <span className="text-xs font-semibold text-amber-700">{formatVnd(stagedPriceMax)}</span>
          </div>
          <input
            type="range"
            min={100_000}
            max={DEFAULT_PRICE_MAX}
            step={50_000}
            value={stagedPriceMax}
            onChange={(e) => onStagedPriceMaxChange(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="mt-1 flex justify-between text-[10px] text-stone-400">
            <span>100K</span>
            <span>5tr</span>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4">
          {pendingChanges > 0 ? (
            <>
              <p className="mb-2 text-xs text-stone-500">
                Có <span className="font-semibold text-amber-700">{pendingChanges}</span> thay đổi chưa áp dụng
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onApply}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift"
                >
                  <Check className="h-4 w-4" /> Áp dụng
                </button>
                <button
                  onClick={onDiscard}
                  className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:border-stone-400 hover:text-stone-900"
                >
                  Hủy
                </button>
              </div>
            </>
          ) : (
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-400"
            >
              <Check className="h-4 w-4" /> Đã áp dụng
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
