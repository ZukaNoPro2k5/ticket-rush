'use client';

import { useMemo, useState } from 'react';
import type { BookingRules, DisplayEvent, Event, EventCategory, EventDetail } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import type { EventTabKey } from '@/data/eventDetailData';
import {
  AboutTab,
  DetailSidebarCTA,
  EventHero,
  EventTabs,
  MobileStickyCTA,
  SimilarEvents,
  VenueTab,
} from '@/components/event-detail';

const DAY_MS = 86_400_000;
const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'Âm nhạc',
  arts: 'Nghệ thuật',
  sports: 'Thể thao',
  food: 'Ẩm thực',
  entertainment: 'Giải trí',
  workshop: 'Workshop',
  stage: 'Sân khấu',
  other: 'Khác',
};

function deriveCityFromVenue(venue: string): string {
  const normalized = venue.toLowerCase();
  if (normalized.includes('hà nội') || normalized.includes('ha noi')) return 'Hà Nội';
  if (normalized.includes('hồ chí minh') || normalized.includes('ho chi minh') || normalized.includes('hcm')) return 'TP. HCM';
  if (normalized.includes('đà nẵng') || normalized.includes('da nang')) return 'Đà Nẵng';
  if (normalized.includes('hải phòng') || normalized.includes('hai phong')) return 'Hải Phòng';
  if (normalized.includes('huế') || normalized.includes('hue')) return 'Huế';
  const parts = venue.split(',');
  return parts[parts.length - 1]?.trim() || 'Việt Nam';
}

function toDisplayEvent(e: Event): DisplayEvent {
  const date = new Date(e.event_date);
  const pad = (n: number) => String(n).padStart(2, '0');
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const total = e.total_seats ?? 0;
  const available = e.available_seats ?? total;
  const soldPercent = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
  const createdAge = Date.now() - new Date(e.created_at).getTime();

  let badge: DisplayEvent['badge'];
  if (soldPercent >= 90) badge = 'almost-sold';
  else if (soldPercent >= 70) badge = 'hot';
  else if (createdAge < 7 * DAY_MS) badge = 'new';

  return {
    id: e.id,
    title: e.title,
    category: CATEGORY_LABELS[e.category],
    categoryKey: e.category,
    venue: e.venue,
    city: deriveCityFromVenue(e.venue),
    date: e.event_date,
    dateLabel: `${weekdays[date.getDay()]}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}`,
    timeLabel: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    poster: e.poster_url || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80',
    priceFrom: e.min_price ?? 0,
    priceTo: e.max_price ?? e.min_price ?? 0,
    soldPercent,
    badge,
  };
}

function getPriceRange(event: EventDetail): { minPrice: number; maxPrice: number } {
  const zonePrices = event.seat_zones.map((zone) => zone.price).filter((price) => price > 0);
  const minPrice = event.min_price ?? (zonePrices.length > 0 ? Math.min(...zonePrices) : 0);
  const maxPrice = event.max_price ?? Math.max(...zonePrices, minPrice);
  return { minPrice, maxPrice };
}

interface Props {
  event: EventDetail;
  similarEvents: Event[];
  bookingRules: BookingRules | null;
}

export default function EventDetailClient({ event, similarEvents, bookingRules }: Props) {
  const [tab, setTab] = useState<EventTabKey>('about');
  const displayEvent = useMemo(() => toDisplayEvent(event), [event]);
  const similar = useMemo(() => similarEvents.map(toDisplayEvent), [similarEvents]);
  const { minPrice, maxPrice } = getPriceRange(event);
  const bookingHref = event.queue_enabled ? `/events/${event.id}/queue` : `/events/${event.id}/seats`;

  return (
    <main className="min-h-screen bg-stone-50 pb-24 lg:pb-0">
      <Navbar variant="solid" />
      <EventHero event={displayEvent} />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <EventTabs active={tab} onChange={setTab} />

          {tab === 'about' && (
            <AboutTab
              event={displayEvent}
              description={event.description}
              zones={event.seat_zones}
              holdMinutes={bookingRules?.ticket_hold_minutes ?? 10}
            />
          )}
          {tab === 'venue' && <VenueTab event={displayEvent} />}
        </div>

        <DetailSidebarCTA event={displayEvent} minPrice={minPrice} maxPrice={maxPrice} bookingHref={bookingHref} />
      </div>

      <SimilarEvents events={similar} />
      <MobileStickyCTA minPrice={minPrice} bookingHref={bookingHref} />
    </main>
  );
}
