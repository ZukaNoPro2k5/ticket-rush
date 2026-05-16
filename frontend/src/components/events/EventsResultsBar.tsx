'use client';

import { ArrowUpDown, ChevronDown, Grid3x3, List } from 'lucide-react';
import { SORT_OPTIONS, type SortKey, type ViewMode } from '@/lib/utils/eventsFilters';

interface Props {
  loading: boolean;
  totalCount: number;
  sort: SortKey;
  view: ViewMode;
  onSortChange: (v: SortKey) => void;
  onViewChange: (v: ViewMode) => void;
}

export function EventsResultsBar({
  loading,
  totalCount,
  sort,
  view,
  onSortChange,
  onViewChange,
}: Props) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-stone-600">
        {loading ? (
          <span className="inline-block h-4 w-32 animate-pulse rounded bg-stone-200" />
        ) : (
          <>
            Tìm thấy <span className="font-bold text-stone-900">{totalCount}</span> sự kiện
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="h-10 appearance-none rounded-full border border-stone-200 bg-white pl-9 pr-8 text-sm font-medium text-stone-700 focus:border-amber-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        </div>
        <div className="flex h-10 items-center gap-0.5 rounded-full border border-stone-200 bg-white p-0.5">
          <button
            onClick={() => onViewChange('grid')}
            aria-label="Xem dạng lưới"
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
              view === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewChange('list')}
            aria-label="Xem dạng danh sách"
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
              view === 'list' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
