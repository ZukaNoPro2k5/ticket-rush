'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { TIME_TABS, type TimeTabKey } from '@/data/uiConfig';
import type { DisplayEvent } from '@/types';
import { cardVariant, fadeUp, staggerContainer, useSectionInView } from '@/lib/motion';
import { EventCard, EventCardSkeleton } from '@/components/events';

export function ThisWeekSection({ allEvents = [] }: { allEvents?: DisplayEvent[] }) {
  const [tab, setTab] = useState<TimeTabKey>('week');
  const { ref, inView } = useSectionInView();

  const events = useMemo(() => {
    if (tab === 'today') return allEvents.slice(0, 4);
    if (tab === 'weekend') return allEvents.filter((_, i) => i % 2 === 0).slice(0, 8);
    if (tab === 'month') return allEvents.slice(0, 8);
    return allEvents.slice(0, 8);
  }, [tab, allEvents]);

  return (
    <section className="bg-white py-12 lg:py-16">
      <div ref={ref} className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-6 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Calendar className="h-3.5 w-3.5" /> Sẽ diễn ra
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Sự kiện sắp diễn ra</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Đặt vé sớm — giá tốt nhất, chỗ đẹp nhất</p>
          </div>
          <Link href="/events" className="hidden items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 md:inline-flex">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="mb-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {TIME_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-stone-900 text-white shadow-lift'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {events.length === 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            key={tab}
            variants={staggerContainer(0.05)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {events.map((ev) => (
              <motion.div key={ev.id} variants={cardVariant}>
                <EventCard event={ev} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
