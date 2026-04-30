'use client';

import type { EventTabKey } from '@/data/eventDetailData';

interface Props {
  active: EventTabKey;
  onChange: (tab: EventTabKey) => void;
}

const TABS: { key: EventTabKey; label: string }[] = [
  { key: 'about', label: 'Giới thiệu' },
  { key: 'lineup', label: 'Chương trình' },
  { key: 'venue', label: 'Địa điểm' },
  { key: 'faq', label: 'Hỏi đáp' },
  { key: 'reviews', label: 'Đánh giá' },
];

export function EventTabs({ active, onChange }: Props) {
  return (
    <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-stone-200 bg-stone-50/95 px-4 backdrop-blur-md lg:-mx-8 lg:px-8">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`relative flex-shrink-0 px-4 py-3.5 text-sm font-semibold transition-colors ${
              active === t.key ? 'text-amber-700' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {t.label}
            {active === t.key && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-amber-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}
