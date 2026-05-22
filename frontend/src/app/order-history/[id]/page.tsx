'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, MapPin, Tag, Ticket, Banknote, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { fadeUp } from '@/lib/motion';
import api from '@/lib/api/client';
import type { BookingDetail, BookingStatus } from '@/types';
import { useLocale } from '@/components/providers/LocaleProvider';
import { localeTag } from '@/lib/i18n';

function StatusBadge({ status }: { status: BookingStatus }) {
  const { messages } = useLocale();
  const { icon: Icon, label, cls } = {
    confirmed: { icon: CheckCircle2, label: messages.orders.confirmed, cls: 'bg-emerald-50 text-emerald-700' },
    pending: { icon: Clock, label: messages.orders.pending, cls: 'bg-amber-50 text-amber-700' },
    cancelled: { icon: XCircle, label: messages.orders.cancelled, cls: 'bg-rose-50 text-rose-600' },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cls}`}>
      <Icon className="h-4 w-4" /> {label}
    </span>
  );
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OrderDetailPage() {
  const { formatCurrency, locale, messages } = useLocale();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ success: boolean; data: BookingDetail }>(`/bookings/${id}`)
      .then(({ data }) => setBooking(data.data))
      .catch(() => router.replace('/order-history'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <AccountLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-40 rounded-xl bg-stone-100" />
          <div className="h-48 rounded-2xl bg-stone-100" />
          <div className="h-32 rounded-2xl bg-stone-100" />
        </div>
      </AccountLayout>
    );
  }

  if (!booking) return null;

  return (
    <AccountLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        {/* Back nav */}
        <Link
          href="/order-history"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" /> {messages.orders.back}
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-900">{messages.orders.order} #{booking.id}</h1>
            <p className="mt-0.5 text-sm text-stone-400">
              {messages.orders.bookedAt} - <span className="text-stone-500">{formatDate(booking.created_at, localeTag(locale))}</span>
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Event card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">{messages.orders.event}</h2>
          <p className="text-lg font-bold text-stone-900">{booking.event.title}</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-stone-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-stone-400" />
              {booking.event.venue}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0 text-stone-400" />
              {formatDate(booking.event.event_date, localeTag(locale))}
            </span>
          </div>
          <Link
            href={`/events/${booking.event.id}`}
            className="mt-3 inline-block text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            {messages.orders.viewEvent} →
          </Link>
        </div>

        {/* Seats */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
            {messages.orders.seatsTitle} ({booking.seats.length})
          </h2>
          <div className="divide-y divide-stone-100">
            {booking.seats.map((seat) => (
              <div key={seat.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="flex items-center gap-2 text-sm text-stone-700">
                  <Ticket className="h-4 w-4 shrink-0 text-stone-400" />
                  {seat.zone_name} — {seat.row_label}{seat.col_number}
                </span>
                <span className="text-sm font-semibold text-stone-900">{formatCurrency(seat.price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment summary */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">{messages.orders.summary}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>{messages.orders.subtotal}</span>
              <span>{formatCurrency(booking.subtotal)}</span>
            </div>
            {booking.promo_code && (
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> {booking.promo_code}
                </span>
                <span>-{formatCurrency(booking.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-stone-100 pt-2.5 font-bold text-stone-900">
              <span className="flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-stone-400" /> {messages.orders.total}
              </span>
              <span className="text-lg text-amber-600">{formatCurrency(booking.total_amount)}</span>
            </div>
          </div>
        </div>

        {booking.payment && (
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">{messages.orders.payment}</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600">{messages.orders.method}</span>
              <span className="font-semibold text-stone-900">{booking.payment.method.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Confirmation date */}
        {booking.confirmed_at && (
          <p className="text-center text-xs text-stone-400">
            {messages.orders.confirmedAt} {formatDate(booking.confirmed_at, localeTag(locale))}
          </p>
        )}
      </motion.div>
    </AccountLayout>
  );
}
