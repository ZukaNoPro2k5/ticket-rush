import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { AlertCircle } from 'lucide-react';
import type { ApiResponse, BookingRules, Event, EventDetail } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import EventDetailClient from './EventDetailClient';
import { DEFAULT_LOCALE, LOCALE_COOKIE, getMessages, isLocale, type Locale } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80';

async function fetchApiData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiResponse<T>;
    return body.data ?? null;
  } catch {
    return null;
  }
}

async function fetchEvent(id: number): Promise<EventDetail | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  return fetchApiData<EventDetail>(`/events/${id}`);
}

async function fetchSimilarEvents(event: EventDetail): Promise<Event[]> {
  const params = new URLSearchParams({
    category: event.category,
    limit: '5',
    sort: 'event_date',
    order: 'asc',
  });
  const data = await fetchApiData<{ events: Event[] }>(`/events?${params.toString()}`);
  return (data?.events ?? []).filter((item) => item.id !== event.id).slice(0, 4);
}

async function fetchBookingRules(): Promise<BookingRules | null> {
  return fetchApiData<BookingRules>('/bookings/rules');
}

function getRequestLocale(): Locale {
  const cookieValue = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
}

function buildDescription(event: EventDetail, locale: Locale): string {
  const raw = event.description?.trim();
  if (raw) return raw.length > 155 ? `${raw.slice(0, 152)}...` : raw;
  const copy = getMessages(locale).eventDetail;
  return `${event.title} ${copy.metadataAt} ${event.venue}. ${copy.metadataFallback}`;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const copy = getMessages(getRequestLocale()).eventDetail;
  const event = await fetchEvent(Number(params.id));
  if (!event) {
    return {
      title: `${copy.notFoundTitle} | TicketRush`,
      description: copy.notFoundMetadata,
    };
  }

  const description = buildDescription(event, getRequestLocale());
  const image = event.poster_url || FALLBACK_POSTER;

  return {
    title: `${event.title} | TicketRush`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: event.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [image],
    },
  };
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const copy = getMessages(getRequestLocale()).eventDetail;
  const event = await fetchEvent(Number(params.id));

  if (!event) {
    return (
      <main className="min-h-screen bg-stone-50">
        <Navbar variant="solid" />
        <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-stone-900">{copy.notFoundTitle}</h1>
          <p className="mt-2 text-sm text-stone-500">{copy.notFoundHint}</p>
          <Link
            href="/events"
            className="mt-6 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-amber-600"
          >
            {copy.backToList}
          </Link>
        </section>
      </main>
    );
  }

  const [similarEvents, bookingRules] = await Promise.all([
    fetchSimilarEvents(event),
    fetchBookingRules(),
  ]);
  return <EventDetailClient event={event} similarEvents={similarEvents} bookingRules={bookingRules} />;
}
