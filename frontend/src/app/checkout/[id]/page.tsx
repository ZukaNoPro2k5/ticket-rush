'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  MapPin,
  Ticket,
  Tag,
  Wallet,
  XCircle,
} from 'lucide-react';
import api from '@/lib/api/client';
import { useCountdown } from '@/hooks/useCountdown';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import { PaymentQrMock } from '@/components/checkout/PaymentQrMock';
import { useLocale } from '@/components/providers/LocaleProvider';
import { localeTag } from '@/lib/i18n';
import type { BookingDetail } from '@/types';

type PaymentMethod = {
  id: string;
  name: string;
  description: string;
};

const METHOD_ICONS: Record<string, typeof CreditCard> = {
  vnpay: Landmark,
  momo: Wallet,
  stripe: CreditCard,
};

function dateTime(value: string, locale: string) {
  return new Date(value).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function CheckoutContent() {
  const { formatCurrency, locale, messages } = useLocale();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const bookingId = Number(params.id);

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodId, setMethodId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const countdown = useCountdown(booking?.expires_at ?? null);
  const expired = booking?.status === 'pending' && countdown === 0;

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get<{ success: boolean; data: BookingDetail }>(`/bookings/${bookingId}`),
      api.get<{ success: boolean; data: PaymentMethod[] }>('/payments/methods'),
    ])
      .then(([bookingRes, methodsRes]) => {
        if (!alive) return;
        const nextBooking = bookingRes.data.data;
        const nextMethods = methodsRes.data.data ?? [];
        setBooking(nextBooking);
        setMethods(nextMethods);
        setMethodId(nextBooking.payment?.method ?? nextMethods[0]?.id ?? '');
        setPromoCode(nextBooking.promo_code ?? '');
      })
      .catch(() => {
        toast.error(messages.checkout.loadFailed);
        router.replace('/order-history');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [bookingId, messages.checkout.loadFailed, router]);

  const selectedMethod = useMemo(
    () => methods.find((method) => method.id === methodId) ?? null,
    [methodId, methods],
  );

  const pay = async () => {
    if (!booking || !methodId) {
      toast.error(messages.checkout.chooseMethod);
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/bookings/${booking.id}/confirm`, { payment_method: methodId });
      mutate((key) => typeof key === 'string' && (key.startsWith('/tickets/my') || key.startsWith('/bookings/my')));
      toast.success(messages.checkout.paid);
      router.push('/my-tickets');
    } catch (err) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message ?? messages.checkout.payFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const applyPromo = async () => {
    if (!booking || !promoCode.trim()) {
      toast.error(messages.checkout.enterPromo);
      return;
    }
    setApplyingPromo(true);
    try {
      const res = await api.post<{ success: boolean; data: BookingDetail }>(`/bookings/${booking.id}/promo`, {
        code: promoCode.trim(),
      });
      setBooking(res.data.data);
      setPromoCode(res.data.data.promo_code ?? promoCode.trim().toUpperCase());
      toast.success(messages.checkout.promoApplied);
    } catch (err) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error(message ?? messages.checkout.promoFailed);
    } finally {
      setApplyingPromo(false);
    }
  };

  const cancel = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      await api.post(`/bookings/${booking.id}/cancel`);
      toast(messages.checkout.cancelled);
      router.push(`/events/${booking.event.id}/seats`);
    } catch {
      toast.error(messages.checkout.cancelFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar variant="solid" />
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="h-96 animate-pulse rounded-3xl bg-stone-100" />
            <div className="h-80 animate-pulse rounded-3xl bg-stone-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar variant="solid" />
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/events/${booking.event.id}/seats`}
            className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-800"
          >
            <ArrowLeft className="h-4 w-4" /> {messages.checkout.backToTickets}
          </Link>
          {booking.status === 'pending' && !expired && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
              <Clock3 className="h-4 w-4" /> {messages.checkout.timeLeft} {formatCountdown(countdown)}
            </span>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{messages.checkout.step}</p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-stone-900">
                {messages.checkout.paymentFor} #{booking.id}
              </h1>
            </div>

            {booking.status === 'confirmed' ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center gap-2 font-semibold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5" /> {messages.checkout.paidOrder}
                </div>
                <p className="mt-2 text-sm text-emerald-700">{messages.checkout.ticketsCreated}</p>
              </div>
            ) : expired ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
                <div className="flex items-center gap-2 font-semibold text-rose-700">
                  <XCircle className="h-5 w-5" /> {messages.checkout.expiredOrder}
                </div>
                <p className="mt-2 text-sm text-rose-600">{messages.checkout.chooseAgain}</p>
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-soft">
                  <h2 className="mb-4 font-semibold text-stone-900">{messages.checkout.selectMethod}</h2>

                  <div className="space-y-3">
                    {methods.map((method) => {
                      const Icon = METHOD_ICONS[method.id] ?? CreditCard;
                      const active = method.id === methodId;
                      return (
                        <label
                          key={method.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                            active
                              ? 'border-amber-300 bg-amber-50 ring-1 ring-amber-200'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment-method"
                            checked={active}
                            onChange={() => setMethodId(method.id)}
                            className="mt-1 accent-amber-500"
                          />
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-stone-700">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-stone-900">{method.name}</span>
                            <span className="mt-0.5 block text-sm leading-6 text-stone-500">{method.description}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {selectedMethod?.id === 'vnpay' && (
                  <PaymentQrMock bookingId={booking.id} amount={booking.total_amount} expiresAt={booking.expires_at} />
                )}
              </>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-soft">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">{messages.checkout.summary}</h2>
              <h3 className="mt-3 font-semibold text-stone-900">{booking.event.title}</h3>
              <div className="mt-2 space-y-1.5 text-sm text-stone-500">
                <p className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {booking.event.venue}
                </p>
                <p className="flex gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0" /> {dateTime(booking.event.event_date, localeTag(locale))}
                </p>
              </div>

              <div className="mt-4 border-t border-stone-100 pt-4">
                <p className="mb-2 text-sm font-semibold text-stone-700">
                  {messages.checkout.heldTickets} ({booking.seats.length})
                </p>
                <div className="space-y-2">
                  {booking.seats.map((seat) => (
                    <div key={seat.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2 text-stone-600">
                        <Ticket className="h-4 w-4 shrink-0 text-stone-400" />
                        <span className="truncate">{seat.zone_name} · {seat.row_label}{seat.col_number}</span>
                      </span>
                      <span className="shrink-0 font-medium text-stone-900">{formatCurrency(seat.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>{messages.checkout.subtotal}</span>
                  <span>{formatCurrency(booking.subtotal)}</span>
                </div>
                {booking.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>{messages.checkout.discount}</span>
                    <span>-{formatCurrency(booking.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 font-bold text-stone-900">
                  <span className="inline-flex items-center gap-1.5">
                    <Banknote className="h-4 w-4 text-stone-400" /> {messages.checkout.total}
                  </span>
                  <span className="text-lg text-amber-600">{formatCurrency(booking.total_amount)}</span>
                </div>
              </div>
            </div>

            {booking.status === 'pending' && !expired && (
              <div className="space-y-3">
                <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-soft">
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                    <Tag className="h-3.5 w-3.5" />
                    {messages.checkout.promoCode}
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                      placeholder={messages.checkout.promoPlaceholder}
                      className="h-11 min-w-0 flex-1 rounded-2xl border border-stone-200 px-3 text-sm uppercase tracking-wider outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 placeholder:normal-case placeholder:tracking-normal"
                    />
                    <button
                      onClick={applyPromo}
                      disabled={applyingPromo || !promoCode.trim()}
                      className="rounded-2xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 disabled:text-stone-300"
                    >
                      {applyingPromo ? messages.checkout.applying : messages.checkout.applyPromo}
                    </button>
                  </div>
                  {booking.promo_code && (
                    <p className="mt-2 text-xs text-emerald-600">
                      {messages.checkout.usingCode} <span className="font-semibold">{booking.promo_code}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={pay}
                  disabled={submitting || !methodId}
                  className="w-full rounded-2xl bg-stone-900 px-4 py-3.5 font-semibold text-white transition hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {submitting ? messages.checkout.processing : `${messages.checkout.pay} ${formatCurrency(booking.total_amount)}`}
                </button>
                <button
                  onClick={cancel}
                  disabled={submitting}
                  className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  {messages.checkout.cancelAndRelease}
                </button>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <Link
                href="/my-tickets"
                className="block rounded-2xl bg-stone-900 px-4 py-3.5 text-center font-semibold text-white hover:bg-stone-800"
              >
                {messages.checkout.viewMine}
              </Link>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
