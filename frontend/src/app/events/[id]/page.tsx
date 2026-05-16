import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import type { ApiResponse, Event, EventDetail } from '@/types';
import { DetailNavbar } from '@/components/event-detail';
import EventDetailClient from './EventDetailClient';

export const dynamic = 'force-dynamic';

const API_BASE = (
  process.env.BACKEND_INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api'
).replace(/\/$/, '');
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80';

type ApiFetchResult<T> = {
  data: T | null;
  status: number | null;
  failed: boolean;
};

async function fetchApiData<T>(path: string): Promise<ApiFetchResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return { data: null, status: res.status, failed: false };
    const body = (await res.json()) as ApiResponse<T>;
    return { data: body.data ?? null, status: res.status, failed: false };
  } catch {
    return { data: null, status: null, failed: true };
  }
}

async function fetchEvent(id: number): Promise<ApiFetchResult<EventDetail>> {
  if (!Number.isInteger(id) || id <= 0) {
    return { data: null, status: 400, failed: false };
  }
  return fetchApiData<EventDetail>(`/events/${id}`);
}

async function fetchSimilarEvents(event: EventDetail): Promise<Event[]> {
  const params = new URLSearchParams({
    category: event.category,
    limit: '5',
    sort: 'event_date',
    order: 'asc',
  });
  const result = await fetchApiData<{ events: Event[] }>(`/events?${params.toString()}`);
  return (result.data?.events ?? []).filter((item) => item.id !== event.id).slice(0, 4);
}

function buildDescription(event: EventDetail): string {
  const raw = event.description?.trim();
  if (raw) return raw.length > 155 ? `${raw.slice(0, 152)}...` : raw;
  return `${event.title} tại ${event.venue}. Xem thông tin sự kiện, giá vé và sơ đồ ghế trên TicketRush.`;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: event } = await fetchEvent(Number(params.id));
  if (!event) {
    return {
      title: 'Không tìm thấy sự kiện | TicketRush',
      description: 'Sự kiện không tồn tại hoặc chưa được công bố.',
    };
  }

  const description = buildDescription(event);
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
  const eventResult = await fetchEvent(Number(params.id));
  const event = eventResult.data;

  if (!event) {
    const apiUnavailable = eventResult.failed || (eventResult.status !== null && eventResult.status >= 500);
    const title = apiUnavailable ? 'Backend chưa sẵn sàng' : 'Không tìm thấy sự kiện';
    const description = apiUnavailable
      ? 'Không thể tải dữ liệu sự kiện từ API. Hãy kiểm tra backend rồi thử lại.'
      : 'Sự kiện có thể chưa được publish, đã bị hủy hoặc không tồn tại.';

    return (
      <main className="min-h-screen bg-stone-50">
        <DetailNavbar />
        <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-stone-900">{title}</h1>
          <p className="mt-2 text-sm text-stone-500">{description}</p>
          <Link
            href="/events"
            className="mt-6 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-amber-600"
          >
            Quay lại danh sách
          </Link>
        </section>
      </main>
    );
  }

  const similarEvents = await fetchSimilarEvents(event);
  return <EventDetailClient event={event} similarEvents={similarEvents} />;
}
