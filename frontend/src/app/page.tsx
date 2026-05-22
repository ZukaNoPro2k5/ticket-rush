'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { getMyProfile } from '@/lib/api/users';
import { toDisplayEvent } from '@/lib/utils/eventMappers';
import { useAuthStore } from '@/stores/authStore';
import type { DisplayEvent } from '@/types';

export default function HomePage() {
  const [homeEvents, setHomeEvents] = useState<DisplayEvent[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<DisplayEvent[]>([]);
  const [newEvents, setNewEvents] = useState<DisplayEvent[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<DisplayEvent[]>([]);
  const [hasPersonalization, setHasPersonalization] = useState(false);
  const [eventsReady, setEventsReady] = useState(false);
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    Promise.all([
      listEvents({ limit: 200, sort: 'event_date', order: 'asc' }),
      listEvents({ limit: 10, sort: 'sold', order: 'desc' }),
      listEvents({ limit: 8, sort: 'created_at', order: 'desc' }),
    ])
      .then(([upcoming, trending, newest]) => {
        const now = Date.now();
        const isUpcoming = (event: DisplayEvent) => new Date(event.date).getTime() >= now;
        setHomeEvents(
          upcoming.events
            .map(toDisplayEvent)
            .filter(isUpcoming),
        );
        setTrendingEvents(trending.events.map(toDisplayEvent).filter(isUpcoming));
        setNewEvents(newest.events.map(toDisplayEvent).filter(isUpcoming));
        setEventsReady(true);
      })
      .catch(() => {
        setEventsReady(true); // show fallback on error, don't stay on skeleton
      });
  }, []);

  useEffect(() => {
    if (!eventsReady) return;
    if (!isAuthenticated) {
      setRecommendedEvents(homeEvents.slice(0, 4));
      setHasPersonalization(false);
      return;
    }

    let alive = true;
    getMyProfile()
      .then((profile) => {
        if (!alive) return;
        const categories = profile.category_preferences ?? [];
        const preferredCity = profile.preferred_city?.trim();
        const tailored = homeEvents.filter((event) => {
          const categoryMatch = categories.length === 0 || categories.includes(event.categoryKey);
          const cityMatch = !preferredCity || event.city === preferredCity;
          return categoryMatch && cityMatch;
        });
        setRecommendedEvents((tailored.length ? tailored : homeEvents).slice(0, 4));
        setHasPersonalization(categories.length > 0 || Boolean(preferredCity));
      })
      .catch(() => {
        if (!alive) return;
        setRecommendedEvents(homeEvents.slice(0, 4));
        setHasPersonalization(false);
      });
    return () => { alive = false; };
  }, [eventsReady, homeEvents, isAuthenticated]);

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <HeroCarousel events={homeEvents} loading={!eventsReady} />
      <CategoriesGrid events={homeEvents} />
      <ThisWeekSection allEvents={homeEvents} loading={!eventsReady} />
      <TrendingLeaderboard events={trendingEvents} loading={!eventsReady} />
      <ForYouSection events={recommendedEvents} loading={!eventsReady} personalized={hasPersonalization} />
      <NewEventsGrid events={newEvents} loading={!eventsReady} />
      <NewsSection />
      <TrustSignals />
      <Footer />
    </main>
  );
}
