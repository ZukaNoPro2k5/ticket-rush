'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AlertCircle, Search } from 'lucide-react';
import type { DisplayEvent, Event, EventCategory } from '@/types';
import { listEvents } from '@/lib/api/events';
import {
  DEFAULT_PRICE_MAX,
  PAGE_SIZE,
  type SortKey,
  type TimeRangeKey,
  type ViewMode,
} from '@/lib/utils/eventsFilters';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  EventCardCompact,
  EventCardList,
  EventsSearchHero,
  EventsCategoryBar,
  EventsFilterSidebar,
  EventsResultsBar,
  EventsActiveChips,
  EventsPagination,
  EventsListSkeleton,
} from '@/components/events';

const DAY_MS = 86_400_000;
const VALID_CATEGORIES: EventCategory[] = ['music', 'stage', 'sports', 'workshop', 'other'];
const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'Âm nhạc',
  stage: 'Sân khấu',
  sports: 'Thể thao',
  workshop: 'Workshop',
  other: 'Sự kiện',
};

function isEventCategory(value: string | null): value is EventCategory {
  return !!value && VALID_CATEGORIES.includes(value as EventCategory);
}

function parseSort(value: string | null): SortKey {
  const valid: SortKey[] = ['trending', 'newest', 'upcoming', 'priceAsc', 'priceDesc'];
  return valid.includes(value as SortKey) ? (value as SortKey) : 'trending';
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

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
    poster: e.poster_url || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
    priceFrom: e.min_price ?? 0,
    priceTo: e.max_price ?? e.min_price ?? 0,
    soldPercent,
    badge,
  };
}

function filterByTimeRange(events: DisplayEvent[], range: TimeRangeKey): DisplayEvent[] {
  if (range === 'all') return events;
  const now = Date.now();
  return events.filter((e) => {
    const t = new Date(e.date).getTime();
    if (range === 'today') return t >= now && t <= now + DAY_MS;
    if (range === 'weekend') {
      const d = new Date(e.date).getDay();
      return d === 0 || d === 6;
    }
    if (range === 'week') return t >= now && t <= now + 7 * DAY_MS;
    if (range === 'month') return t >= now && t <= now + 30 * DAY_MS;
    return true;
  });
}

function sortEvents(events: DisplayEvent[], sort: SortKey): DisplayEvent[] {
  if (sort === 'priceAsc') return [...events].sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
  if (sort === 'priceDesc') return [...events].sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
  return events;
}

export default function EventsListingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [urlReady, setUrlReady] = useState(false);

  const [apiEvents, setApiEvents] = useState<DisplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<EventCategory | null>(null);

  const [stagedTime, setStagedTime] = useState<TimeRangeKey>('all');
  const [stagedCity, setStagedCity] = useState('Tất cả');
  const [stagedPriceMax, setStagedPriceMax] = useState(DEFAULT_PRICE_MAX);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('all');
  const [city, setCity] = useState('Tất cả');
  const [priceMax, setPriceMax] = useState(DEFAULT_PRICE_MAX);

  const [sort, setSort] = useState<SortKey>('trending');
  const [view, setView] = useState<ViewMode>('grid');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('search')?.trim() ?? '';
    const initialCategory = params.get('category');

    setSearchInput(initialQuery);
    setQuery(initialQuery);
    setActiveCat(isEventCategory(initialCategory) ? initialCategory : null);
    setSort(parseSort(params.get('sort')));
    setCurrentPage(parsePage(params.get('page')));
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (activeCat) params.set('category', activeCat);
    if (sort !== 'trending') params.set('sort', sort);
    if (currentPage > 1) params.set('page', String(currentPage));

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [activeCat, currentPage, pathname, query, router, sort, urlReady]);

  const pendingChanges =
    (stagedTime !== timeRange ? 1 : 0) +
    (stagedCity !== city ? 1 : 0) +
    (stagedPriceMax !== priceMax ? 1 : 0);

  const activeFilterCount =
    (activeCat ? 1 : 0) +
    (timeRange !== 'all' ? 1 : 0) +
    (city !== 'Tất cả' ? 1 : 0) +
    (priceMax < DEFAULT_PRICE_MAX ? 1 : 0) +
    (query ? 1 : 0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiSort = sort === 'newest' ? 'created_at' : 'event_date';
      const apiOrder = sort === 'newest' ? 'desc' : 'asc';
      const result = await listEvents({
        search: query || undefined,
        category: activeCat ?? undefined,
        sort: apiSort,
        order: apiOrder,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setApiEvents(result.events.map(toDisplayEvent));
      setTotalPages(Math.max(1, result.pagination.total_pages));
      setTotalCount(result.pagination.total);
    } catch {
      setApiEvents([]);
      setTotalPages(1);
      setTotalCount(0);
      setError('Không thể tải danh sách sự kiện. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [query, activeCat, sort, currentPage]);

  useEffect(() => {
    if (!urlReady) return;
    void fetchEvents();
  }, [fetchEvents, urlReady]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeCat, sort]);

  const submitSearch = () => setQuery(searchInput.trim());
  const clearSearch = () => {
    setSearchInput('');
    setQuery('');
  };

  const selectCategory = (k: EventCategory) => setActiveCat((prev) => (prev === k ? null : k));

  const applyFilters = () => {
    setTimeRange(stagedTime);
    setCity(stagedCity);
    setPriceMax(stagedPriceMax);
  };

  const discardPending = () => {
    setStagedTime(timeRange);
    setStagedCity(city);
    setStagedPriceMax(priceMax);
  };

  const clearTime = () => {
    setStagedTime('all');
    setTimeRange('all');
  };
  const clearCity = () => {
    setStagedCity('Tất cả');
    setCity('Tất cả');
  };
  const clearPrice = () => {
    setStagedPriceMax(DEFAULT_PRICE_MAX);
    setPriceMax(DEFAULT_PRICE_MAX);
  };

  const resetFilters = () => {
    setActiveCat(null);
    clearTime();
    clearCity();
    clearPrice();
    setSearchInput('');
    setQuery('');
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    let arr = apiEvents;
    if (city !== 'Tất cả') arr = arr.filter((e) => e.city === city);
    if (priceMax < DEFAULT_PRICE_MAX) arr = arr.filter((e) => !e.priceFrom || e.priceFrom <= priceMax);
    arr = filterByTimeRange(arr, timeRange);
    return sortEvents(arr, sort);
  }, [apiEvents, city, priceMax, timeRange, sort]);

  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar variant="solid" />

      <EventsSearchHero
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSubmit={submitSearch}
        hasQuery={!!query}
        onClear={clearSearch}
      />

      <EventsCategoryBar activeCat={activeCat} onSelect={selectCategory} />

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <EventsFilterSidebar
            stagedTime={stagedTime}
            stagedCity={stagedCity}
            stagedPriceMax={stagedPriceMax}
            pendingChanges={pendingChanges}
            activeFilterCount={activeFilterCount}
            onStagedTimeChange={setStagedTime}
            onStagedCityChange={setStagedCity}
            onStagedPriceMaxChange={setStagedPriceMax}
            onApply={applyFilters}
            onDiscard={discardPending}
            onResetAll={resetFilters}
          />

          <div>
            <EventsResultsBar
              loading={loading}
              totalCount={totalCount}
              sort={sort}
              view={view}
              onSortChange={setSort}
              onViewChange={setView}
            />

            {activeFilterCount > 0 && (
              <EventsActiveChips
                query={query}
                activeCat={activeCat}
                timeRange={timeRange}
                city={city}
                priceMax={priceMax}
                onClearQuery={clearSearch}
                onClearCategory={() => setActiveCat(null)}
                onClearTime={clearTime}
                onClearCity={clearCity}
                onClearPrice={clearPrice}
                onResetAll={resetFilters}
              />
            )}

            {loading ? (
              <EventsListSkeleton view={view} />
            ) : error ? (
              <ErrorState message={error} onRetry={fetchEvents} />
            ) : filtered.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((ev) => (
                  <EventCardCompact key={ev.id} event={ev} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((ev) => (
                  <EventCardList key={ev.id} event={ev} />
                ))}
              </div>
            )}

            {!loading && !error && (
              <EventsPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-stone-100">
        <Search className="h-7 w-7 text-stone-400" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">Không tìm thấy sự kiện phù hợp</h3>
      <p className="mt-1 text-sm text-stone-500">Thử bỏ bớt bộ lọc hoặc đổi từ khóa khác.</p>
      <button
        onClick={onReset}
        className="mt-4 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-3xl border border-red-100 bg-white py-20 text-center shadow-soft">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">Danh sách sự kiện chưa tải được</h3>
      <p className="mt-1 text-sm text-stone-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-800"
      >
        Thử lại
      </button>
    </div>
  );
}
