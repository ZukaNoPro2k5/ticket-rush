'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { DEFAULT_PRICE_MAX, type TimeRangeKey } from '@/lib/utils/eventsFilters';
import { useLocale } from '@/components/providers/LocaleProvider';

const CITY_OPTIONS = ['Tất cả', 'Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Huế', 'Khác'] as const;

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
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(String(stagedPriceMax));
  const { messages, formatCurrency } = useLocale();
  const timeOptions: { key: TimeRangeKey; label: string }[] = [
    { key: 'all', label: messages.events.timeAll },
    { key: 'today', label: messages.home.today },
    { key: 'weekend', label: messages.home.weekend },
    { key: 'week', label: messages.home.week },
    { key: 'month', label: messages.home.month },
    { key: 'next_month', label: messages.events.nextMonth },
    { key: 'other', label: messages.events.other },
  ];
  const cityLabel = (city: typeof CITY_OPTIONS[number]) => {
    if (city === 'Tất cả') return messages.common.all;
    if (city === 'Khác') return messages.events.other;
    return city;
  };
  const priceLabel = (value: number) => value >= DEFAULT_PRICE_MAX
    ? `${formatCurrency(DEFAULT_PRICE_MAX)}+`
    : formatCurrency(value);

  useEffect(() => {
    if (!editingPrice) setPriceInput(String(stagedPriceMax));
  }, [editingPrice, stagedPriceMax]);

  const commitPriceInput = () => {
    const digitsOnly = Number(priceInput.replace(/[^\d]/g, ''));
    if (!Number.isFinite(digitsOnly) || digitsOnly <= 0) {
      setPriceInput(String(stagedPriceMax));
      setEditingPrice(false);
      return;
    }
    const normalized = Math.min(DEFAULT_PRICE_MAX, Math.max(100_000, Math.round(digitsOnly / 50_000) * 50_000));
    onStagedPriceMaxChange(normalized);
    setPriceInput(String(normalized));
    setEditingPrice(false);
  };

  const renderContent = (radioName: string) => (
    <>
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-stone-900">{messages.events.advancedFilters}</h3>
        {activeFilterCount > 0 && (
          <button onClick={onResetAll} className="text-xs font-medium text-amber-700 hover:text-amber-800">
            {messages.common.clearAll}
          </button>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
          {messages.events.time}
        </label>
        <div className="relative">
          <select
            aria-label={radioName}
            value={stagedTime}
            onChange={(e) => onStagedTimeChange(e.target.value as TimeRangeKey)}
            className="w-full appearance-none rounded-lg border border-stone-200 bg-white px-3 py-2 pr-8 text-sm focus:border-amber-500 focus:outline-none"
          >
            {timeOptions.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
          {messages.events.city}
        </label>
        <div className="relative">
          <select
            value={stagedCity}
            onChange={(e) => onStagedCityChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-stone-200 bg-white px-3 py-2 pr-8 text-sm focus:border-amber-500 focus:outline-none"
          >
            {CITY_OPTIONS.map((c) => (
              <option key={c} value={c}>{cityLabel(c)}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {messages.events.maxPrice}
          </label>
          {editingPrice ? (
            <input
              autoFocus
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={commitPriceInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitPriceInput();
                if (e.key === 'Escape') {
                  setPriceInput(String(stagedPriceMax));
                  setEditingPrice(false);
                }
              }}
              className="w-28 rounded-lg border border-amber-300 px-2 py-1 text-right text-xs font-semibold text-amber-700 outline-none focus:ring-2 focus:ring-amber-200"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingPrice(true)}
              className="rounded-md px-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
            >
              {priceLabel(stagedPriceMax)}
            </button>
          )}
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
              <span className="font-semibold text-amber-700">{pendingChanges}</span> {messages.events.pendingChanges}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onApply}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift"
              >
                <Check className="h-4 w-4" /> {messages.common.apply}
              </button>
              <button
                onClick={onDiscard}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 hover:border-stone-400 hover:text-stone-900"
              >
                {messages.common.cancel}
              </button>
            </div>
          </>
        ) : (
          <button
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-400"
          >
            <Check className="h-4 w-4" /> {messages.events.applied}
          </button>
        )}
      </div>
    </>
  );

  return (
    <aside>
      <details className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft lg:hidden">
        <summary className="cursor-pointer list-none font-display font-bold text-stone-900">
          {messages.events.advancedFilters}
        </summary>
        <div className="mt-5 space-y-6">{renderContent('time-mobile')}</div>
      </details>

      <div className="sticky top-[calc(80px+60px)] hidden space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft lg:block">
        {renderContent('time-desktop')}
      </div>
    </aside>
  );
}
