'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  HeroCarousel,
  CategoriesGrid,
  ThisWeekSection,
  TrendingLeaderboard,
  ForYouSection,
  NewEventsGrid,
  NewsSection,
  TrustSignals,
} from '@/components/home';
import { listEvents } from '@/lib/api/events';
import { toDisplayEvent } from '@/lib/utils/eventMappers';
import type { DisplayEvent } from '@/types';

export default function HomePage() {
  const [homeEvents, setHomeEvents] = useState<DisplayEvent[]>([]);
  const [eventsReady, setEventsReady] = useState(false);

  useEffect(() => {
    listEvents({ limit: 40, sort: 'event_date', order: 'asc' })
      .then((r) => {
        setHomeEvents(r.events.map(toDisplayEvent));
        setEventsReady(true);
      })
      .catch(() => {
        setEventsReady(true); // show fallback on error, don't stay on skeleton
      });
  }, []);

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <HeroCarousel events={homeEvents} loading={!eventsReady} />
      <CategoriesGrid />
      <ThisWeekSection allEvents={homeEvents} />
      <TrendingLeaderboard events={homeEvents} />
      <ForYouSection events={homeEvents.slice(0, 4)} loading={!eventsReady} />
      <NewEventsGrid events={homeEvents.slice(0, 8)} loading={!eventsReady} />
      <NewsSection />
      <TrustSignals />
      <Footer />
    </main>
  );
}
