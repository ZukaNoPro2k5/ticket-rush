'use client';

import { useMemo, useState } from 'react';
import type { Event, EventDetail } from '@/types';
import type { EventTabKey } from '@/data/eventDetailData';
import { toDisplayEvent } from '@/lib/utils/eventMappers';
import {
  AboutTab,
  DetailNavbar,
  DetailSidebarCTA,
  EventHero,
  EventTabs,
  FaqTab,
  LineupTab,
  MobileStickyCTA,
  ReviewsTab,
  SimilarEvents,
  VenueTab,
} from '@/components/event-detail';

function getPriceRange(event: EventDetail): { minPrice: number; maxPrice: number } {
  const zonePrices = event.seat_zones
    .filter((zone) => Number(zone.total_seats ?? 0) > 0)
    .map((zone) => Number(zone.price))
    .filter((price) => price > 0);
  const minPrice = event.min_price ?? (zonePrices.length > 0 ? Math.min(...zonePrices) : 0);
  const maxPrice = event.max_price ?? (zonePrices.length > 0 ? Math.max(...zonePrices) : minPrice);
  return { minPrice, maxPrice };
}

interface Props {
  event: EventDetail;
  similarEvents: Event[];
}

export default function EventDetailClient({ event, similarEvents }: Props) {
  const [tab, setTab] = useState<EventTabKey>('about');
  const displayEvent = useMemo(() => toDisplayEvent(event), [event]);
  const similar = useMemo(() => similarEvents.map(toDisplayEvent), [similarEvents]);
  const { minPrice, maxPrice } = getPriceRange(event);

  return (
    <main className="min-h-screen bg-stone-50 pb-24 lg:pb-0">
      <DetailNavbar />
      <EventHero event={displayEvent} />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <EventTabs active={tab} onChange={setTab} />

          {tab === 'about' && <AboutTab event={displayEvent} description={event.description} zones={event.seat_zones} />}
          {tab === 'lineup' && <LineupTab />}
          {tab === 'venue' && <VenueTab event={displayEvent} />}
          {tab === 'faq' && <FaqTab />}
          {tab === 'reviews' && <ReviewsTab />}
        </div>

        <DetailSidebarCTA event={displayEvent} minPrice={minPrice} maxPrice={maxPrice} />
      </div>

      <SimilarEvents events={similar} />
      <MobileStickyCTA eventId={event.id} minPrice={minPrice} />
    </main>
  );
}
