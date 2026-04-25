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

  useEffect(() => {
    listEvents({ limit: 12, sort: 'event_date', order: 'asc' })
      .then((r) => setHomeEvents(r.events.map(toDisplayEvent)))
      .catch(() => {
        /* fail silently — sections show skeletons */
      });
  }, []);

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <HeroCarousel />
      <CategoriesGrid />
      <ThisWeekSection allEvents={homeEvents} />
      <TrendingLeaderboard />
      <ForYouSection events={homeEvents.slice(0, 4)} />
      <NewEventsGrid events={homeEvents.slice(0, 8)} />
      <NewsSection />
      <TrustSignals />
      <Footer />
    </main>
  );
}
