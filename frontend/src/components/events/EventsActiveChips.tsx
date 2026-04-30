'use client';

import { Clock, MapPin, Search, X } from 'lucide-react';
import type { EventCategory } from '@/types';
import { EVENT_CATEGORY_OPTIONS } from './EventsCategoryBar';
import { DEFAULT_PRICE_MAX, type TimeRangeKey } from '@/lib/utils/eventsFilters';

const TIME_LABELS: Record<TimeRangeKey, string> = {
  all: 'Tất cả thời gian',
  today: 'Hôm nay',
  weekend: 'Cuối tuần',
  week: 'Tuần này',
  month: 'Tháng này',
};

function formatVnd(value: number): string {
  return `${value.toLocaleString('vi-VN')}đ`;
}

interface Props {
  query: string;
  activeCat: EventCategory | null;
  timeRange: TimeRangeKey;
  city: string;
  priceMax: number;
  onClearQuery: () => void;
  onClearCategory: () => void;
  onClearTime: () => void;
  onClearCity: () => void;
  onClearPrice: () => void;
  onResetAll: () => void;
}

export function EventsActiveChips({
  query,
  activeCat,
  timeRange,
  city,
  priceMax,
  onClearQuery,
  onClearCategory,
  onClearTime,
  onClearCity,
  onClearPrice,
  onResetAll,
}: Props) {
  const cat = activeCat ? EVENT_CATEGORY_OPTIONS.find((c) => c.key === activeCat) : null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {query && (
        <button
          onClick={onClearQuery}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200"
        >
          <Search className="h-3 w-3" /> &quot;{query}&quot; <X className="h-3 w-3" />
        </button>
      )}
      {cat && (
        <button
          onClick={onClearCategory}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200"
        >
          {cat.label} <X className="h-3 w-3" />
        </button>
      )}
      {timeRange !== 'all' && (
        <button
          onClick={onClearTime}
          className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200"
        >
          <Clock className="h-3 w-3" /> {TIME_LABELS[timeRange]} <X className="h-3 w-3" />
        </button>
      )}
      {city !== 'Tất cả' && (
        <button
          onClick={onClearCity}
          className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200"
        >
          <MapPin className="h-3 w-3" /> {city} <X className="h-3 w-3" />
        </button>
      )}
      {priceMax < DEFAULT_PRICE_MAX && (
        <button
          onClick={onClearPrice}
          className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200"
        >
          ≤ {formatVnd(priceMax)} <X className="h-3 w-3" />
        </button>
      )}
      <button onClick={onResetAll} className="text-xs font-medium text-amber-700 hover:text-amber-800">
        Xóa tất cả
      </button>
    </div>
  );
}
