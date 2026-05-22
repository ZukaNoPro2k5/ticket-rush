'use client';

import type { EventTabKey } from '@/data/eventDetailData';
import { useLocale } from '@/components/providers/LocaleProvider';

interface Props {
  active: EventTabKey;
  onChange: (tab: EventTabKey) => void;
}

export function EventTabs({ active, onChange }: Props) {
  const { messages } = useLocale();
  const tabs: { key: EventTabKey; label: string }[] = [
    { key: 'about', label: messages.eventDetail.aboutTab },
    { key: 'venue', label: messages.eventDetail.venueTab },
  ];

  return (
    <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-stone-200 bg-stone-50/95 px-4 backdrop-blur-md lg:-mx-8 lg:px-8">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
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
