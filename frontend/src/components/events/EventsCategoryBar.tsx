'use client';

import { SlidersHorizontal } from 'lucide-react';
import type { EventCategory } from '@/types';
import { EVENT_CATEGORY_OPTIONS } from '@/lib/utils/eventCategories';

export { EVENT_CATEGORY_OPTIONS };

interface Props {
  activeCat: EventCategory | null;
  onSelect: (key: EventCategory) => void;
}

export function EventsCategoryBar({ activeCat, onSelect }: Props) {
  return (
    <section className="sticky top-16 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md lg:top-20">
      <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Lọc:
          </span>
          {EVENT_CATEGORY_OPTIONS.map((c) => {
            const active = activeCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => onSelect(c.key)}
                aria-pressed={active}
                className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                  active
                    ? 'border-amber-500 bg-amber-500 text-white shadow-soft'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                }`}
              >
                <i className={`${c.icon} text-xs`} aria-hidden />
                {c.label}
              </button>
            );
          })}
          <span className="ml-auto flex-shrink-0 text-[11px] text-stone-400">
            Chọn 1 danh mục, bấm lại để bỏ chọn
          </span>
        </div>
      </div>
    </section>
  );
}
