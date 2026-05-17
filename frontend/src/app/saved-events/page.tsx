'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { AccountLayout } from '@/components/account/AccountLayout';
import { EventCardCompact } from '@/components/events';
import { listSavedEvents } from '@/lib/api/engagement';
import { toDisplayEvent } from '@/lib/utils/eventMappers';
import { fadeUp } from '@/lib/motion';

export default function SavedEventsPage() {
  const { data, isLoading } = useSWR('/engagement/events/favorites', listSavedEvents);
  const events = (data ?? []).map(toDisplayEvent);

  return (
    <AccountLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Sự kiện đã lưu</h1>
          <p className="mt-1 text-sm text-stone-500">
            {events.length > 0 ? `${events.length} sự kiện bạn muốn quay lại` : 'Những sự kiện bạn lưu sẽ nằm ở đây'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white py-20 text-center shadow-soft">
            <Heart className="h-12 w-12 text-stone-200" />
            <div>
              <p className="font-semibold text-stone-700">Chưa lưu sự kiện nào</p>
              <p className="mt-1 text-sm text-stone-400">Bấm biểu tượng tim ở sự kiện để gom chúng về đây.</p>
            </div>
            <Link href="/events" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600">
              Khám phá sự kiện
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => <EventCardCompact key={event.id} event={event} />)}
          </div>
        )}
      </motion.div>
    </AccountLayout>
  );
}
