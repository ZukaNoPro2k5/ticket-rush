'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import { TIME_TABS, type TimeTabKey } from '@/data/uiConfig';
import type { DisplayEvent } from '@/types';
import { cardVariant, fadeUp, staggerContainer, useSectionInView } from '@/lib/motion';
import { EventCard, EventCardSkeleton } from '@/components/events';
import EmptyState from '@/components/ui/EmptyState';

export function ThisWeekSection({ allEvents = [], loading = false }: { allEvents?: DisplayEvent[]; loading?: boolean }) {
  const [tab, setTab] = useState<TimeTabKey>('week');
  const { ref, inView } = useSectionInView();

  const events = useMemo(() => {
    const sourceData = allEvents;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86_400_000;
    const endOfWeek = startOfToday + 7 * 86_400_000;
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

    if (tab === 'today') {
      return sourceData
        .filter((event) => {
          const time = new Date(event.date).getTime();
          return time >= startOfToday && time < endOfToday;
        })
        .slice(0, 8);
    }

    if (tab === 'weekend') {
      return sourceData
        .filter((event) => {
          const date = new Date(event.date);
          const time = date.getTime();
          const day = date.getDay();
          return time >= startOfToday && time < endOfWeek && (day === 0 || day === 6);
        })
        .slice(0, 8);
    }

    if (tab === 'month') {
      return sourceData
        .filter((event) => {
          const time = new Date(event.date).getTime();
          return time >= startOfToday && time < startOfNextMonth;
        })
        .slice(0, 8);
    }

    return sourceData
      .filter((event) => {
        const time = new Date(event.date).getTime();
        return time >= startOfToday && time < endOfWeek;
      })
      .slice(0, 8);
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

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            variant="events"
            headline="Chưa có sự kiện sắp diễn ra"
            subtext="Khi admin mở bán sự kiện mới, chúng sẽ xuất hiện ở đây ngay."
            className="rounded-2xl border border-stone-200 bg-stone-50"
          />
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
