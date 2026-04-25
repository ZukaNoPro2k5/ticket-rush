'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { THIS_WEEK_EVENTS } from '@/data/uiConfig';
import type { DisplayEvent } from '@/types';
import { DETAIL_ZONES, type EventTabKey } from '@/data/eventDetailData';
import {
  AboutTab, DetailNavbar, DetailSidebarCTA, EventHero, EventTabs, FaqTab,
  LineupTab, MobileStickyCTA, ReviewsTab, SimilarEvents, VenueTab,
} from '@/components/event-detail';

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params?.id) || 101;

  const event: DisplayEvent = useMemo(
    () => THIS_WEEK_EVENTS.find((e) => e.id === eventId) ?? THIS_WEEK_EVENTS[0],
    [eventId],
  );

  const similar = useMemo(
    () => THIS_WEEK_EVENTS.filter((e) => e.id !== event.id).slice(0, 4),
    [event.id],
  );

  const [tab, setTab] = useState<EventTabKey>('about');

  const minPrice = Math.min(...DETAIL_ZONES.map((z) => z.price));
  const maxPrice = Math.max(...DETAIL_ZONES.map((z) => z.price));

  return (
    <main className="min-h-screen bg-stone-50 pb-24 lg:pb-0">
      <DetailNavbar />
      <EventHero event={event} />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <EventTabs active={tab} onChange={setTab} />

          {tab === 'about' && <AboutTab event={event} />}
          {tab === 'lineup' && <LineupTab />}
          {tab === 'venue' && <VenueTab event={event} />}
          {tab === 'faq' && <FaqTab />}
          {tab === 'reviews' && <ReviewsTab />}
        </div>

        <DetailSidebarCTA event={event} minPrice={minPrice} maxPrice={maxPrice} />
      </div>

      <SimilarEvents events={similar} />
      <MobileStickyCTA eventId={event.id} minPrice={minPrice} />
    </main>
  );
}
