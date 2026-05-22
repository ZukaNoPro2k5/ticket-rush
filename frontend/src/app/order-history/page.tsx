'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import {
  History, Calendar, Ticket, CheckCircle2, XCircle, Clock,
  ChevronRight, Banknote,
} from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { TicketRowSkeleton } from '@/components/ui/Skeleton';
import { fadeUp } from '@/lib/motion';
import { useLocale } from '@/components/providers/LocaleProvider';
import { localeTag } from '@/lib/i18n';

interface BookingItem {
  id: number;
  event: { id: number; title: string; event_date: string; poster_url: string | null };
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  seat_count: number;
  confirmed_at: string | null;
}

function StatusBadge({ status }: { status: BookingItem['status'] }) {
  const { messages } = useLocale();
  const cfg = {
    confirmed: {
      icon: CheckCircle2,
      label: messages.orders.confirmed,
      cls: 'bg-emerald-50 text-emerald-700',
    },
    pending: {
      icon: Clock,
      label: messages.orders.pending,
      cls: 'bg-amber-50 text-amber-700',
    },
    cancelled: {
      icon: XCircle,
      label: messages.orders.cancelled,
      cls: 'bg-rose-50 text-rose-600',
    },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.cls}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export default function OrderHistoryPage() {
  const { formatCurrency, locale, messages } = useLocale();
  const [status, setStatus] = useState('');
  const statusTabs = [
    { key: '', label: messages.orders.all },
    { key: 'confirmed', label: messages.orders.confirmed },
    { key: 'pending', label: messages.orders.pending },
    { key: 'cancelled', label: messages.orders.cancelled },
  ];

  const params = new URLSearchParams({ limit: '20' });
  if (status) params.set('status', status);
  const { data, isLoading } = useSWR<{ items: BookingItem[]; pagination: { total: number } }>(
    `/bookings/my?${params.toString()}`,
  );
  const bookings = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const loading = isLoading && !data;

  return (
    <AccountLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">{messages.orders.title}</h1>
          <p className="mt-1 text-sm text-stone-500">
            {total > 0 ? messages.orders.count(total) : messages.orders.emptyCount}
          </p>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1
                ${status === tab.key
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <TicketRowSkeleton key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white py-20 text-center shadow-soft">
            <History className="h-12 w-12 text-stone-200" />
            <div>
              <p className="font-semibold text-stone-700">{messages.orders.emptyTitle}</p>
              <p className="mt-1 text-sm text-stone-400">{messages.orders.emptyDesc}</p>
            </div>
            <Link
              href="/events"
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              {messages.orders.explore}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-shadow hover:shadow-lift"
              >
                {/* Poster */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {booking.event.poster_url ? (
                    <Image
                      src={booking.event.poster_url}
                      alt={booking.event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Ticket className="h-6 w-6 text-stone-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusBadge status={booking.status} />
                    <span className="text-xs text-stone-400">#{booking.id}</span>
                  </div>
                  <Link
                    href={`/events/${booking.event.id}`}
                    className="block truncate font-semibold text-stone-900 hover:text-amber-600 transition-colors"
                  >
                    {booking.event.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatDate(booking.event.event_date, localeTag(locale))}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3 w-3 shrink-0" />
                      {booking.seat_count} {messages.orders.seats}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-stone-700">
                      <Banknote className="h-3 w-3 shrink-0" />
                      {formatCurrency(booking.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <Link
                  href={`/order-history/${booking.id}`}
                  className="flex shrink-0 items-center self-center rounded-xl border border-stone-200 p-2 text-stone-400 hover:bg-stone-50 hover:text-stone-600 transition-colors"
                  aria-label={messages.orders.details}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AccountLayout>
  );
}
