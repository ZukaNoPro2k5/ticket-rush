'use client';

import { SlidersHorizontal } from 'lucide-react';
import type { EventCategory } from '@/types';
import { useLocale } from '@/components/providers/LocaleProvider';

export const EVENT_CATEGORY_OPTIONS: {
  key: EventCategory;
  label: string;
  icon: string;
}[] = [
  { key: 'music', label: 'Âm nhạc', icon: 'fa-solid fa-music' },
  { key: 'arts', label: 'Nghệ thuật', icon: 'fa-solid fa-palette' },
  { key: 'sports', label: 'Thể thao', icon: 'fa-solid fa-futbol' },
  { key: 'food', label: 'Ẩm thực', icon: 'fa-solid fa-utensils' },
  { key: 'entertainment', label: 'Giải trí', icon: 'fa-solid fa-masks-theater' },
  { key: 'workshop', label: 'Workshop', icon: 'fa-solid fa-chalkboard-user' },
  { key: 'stage', label: 'Sân khấu', icon: 'fa-solid fa-theater-masks' },
  { key: 'other', label: 'Khác', icon: 'fa-solid fa-tag' },
];

interface Props {
  activeCat: EventCategory | null;
  onSelect: (key: EventCategory) => void;
}

export function EventsCategoryBar({ activeCat, onSelect }: Props) {
  const { messages } = useLocale();

  return (
    <section className="sticky top-16 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md lg:top-20">
      <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
            <SlidersHorizontal className="h-3.5 w-3.5" /> {messages.events.filter}
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
                {messages.categories[c.key]}
              </button>
            );
          })}
          <span className="ml-auto flex-shrink-0 text-[11px] text-stone-400">
            {messages.events.categoryHint}
          </span>
        </div>
      </div>
    </section>
  );
}
