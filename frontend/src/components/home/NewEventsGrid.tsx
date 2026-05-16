'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { DisplayEvent } from '@/types';
import { cardVariant, fadeUp, staggerContainer, useSectionInView } from '@/lib/motion';
import { EventCard, EventCardSkeleton } from '@/components/events';
import { THIS_WEEK_EVENTS } from '@/data/uiConfig';

export function NewEventsGrid({ events = [], loading = false }: { events?: DisplayEvent[]; loading?: boolean }) {
  const { ref, inView } = useSectionInView();
  const displayEvents = events.length > 0 ? events : THIS_WEEK_EVENTS.slice(0, 8);

  return (
    <section className="bg-stone-50 py-12 lg:py-16">
      <div ref={ref} className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-6 flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Mới mở bán
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Vé mới lên sàn</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Đặt sớm để săn ưu đãi early-bird</p>
          </div>
          <Link href="/events?sort=newest" className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer(0.05)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {displayEvents.map((ev) => (
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
