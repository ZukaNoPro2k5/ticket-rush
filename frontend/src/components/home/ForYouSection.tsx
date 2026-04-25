'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { DisplayEvent } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { cardVariant, fadeUp, staggerContainer, useSectionInView } from '@/lib/motion';
import { EventCard, EventCardSkeleton } from '@/components/events';

function GuestCallout() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100">
          <Sparkles className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <div className="font-semibold text-stone-900">Mở khóa đề xuất riêng cho bạn</div>
          <div className="text-sm text-stone-500">Đăng nhập để nhận gợi ý chính xác hơn từ TicketRush AI</div>
        </div>
      </div>
      <Link
        href="#"
        className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-amber-600"
      >
        Đăng nhập <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function ForYouSection({ events = [] }: { events?: DisplayEvent[] }) {
  const { isAuthenticated, user } = useAuthStore();
  const { ref, inView } = useSectionInView();

  const heading = isAuthenticated && user
    ? `${user.full_name.split(' ').pop()}, có thể bạn sẽ thích`
    : 'Cá nhân hóa cho bạn';
  const description = isAuthenticated
    ? 'Gợi ý dựa trên các sự kiện bạn từng quan tâm'
    : 'Đăng nhập để nhận gợi ý phù hợp gu của bạn';

  return (
    <section className="bg-stone-50 py-12 lg:py-16">
      <div ref={ref} className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-6 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Sparkles className="h-3.5 w-3.5" /> Dành cho bạn
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-stone-900 md:text-3xl">{heading}</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">{description}</p>
          </div>
          <Link href="/events?sort=for-you" className="hidden items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 md:inline-flex">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {!isAuthenticated && (
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
            <GuestCallout />
          </motion.div>
        )}

        {events.length === 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer(0.05)}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
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
