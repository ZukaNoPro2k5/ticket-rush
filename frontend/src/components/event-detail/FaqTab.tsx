'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { DETAIL_FAQ } from '@/data/eventDetailData';

export function FaqTab() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="animate-fadeInUp rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
      <h2 className="font-display text-xl font-bold">Câu hỏi thường gặp</h2>
      <div className="mt-4 divide-y divide-stone-100">
        {DETAIL_FAQ.map((f, i) => (
          <div key={i} className="py-3">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="font-semibold text-stone-900">{f.q}</span>
              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 text-stone-400 transition-transform ${
                  open === i ? 'rotate-180 text-amber-600' : ''
                }`}
              />
            </button>
            {open === i && <p className="mt-2 animate-fadeIn text-sm text-stone-600">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
