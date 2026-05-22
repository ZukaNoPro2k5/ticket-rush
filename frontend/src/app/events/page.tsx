'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { useLocale } from '@/components/providers/LocaleProvider';
import { categoryLabel, localeTag, type Locale } from '@/lib/i18n';

const VALID_CATEGORIES: EventCategory[] = [
  'music',
  'arts',
  'sports',
  'food',
  'entertainment',
  'workshop',
  'stage',
  'other',
];
const DAY_MS = 86_400_000;
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

function deriveCityFromVenue(venue: string, locale: Locale): string {
  const normalized = venue.toLowerCase();
  if (normalized.includes('hà nội') || normalized.includes('ha noi')) return 'Hà Nội';
  if (normalized.includes('hồ chí minh') || normalized.includes('ho chi minh') || normalized.includes('hcm')) return 'TP. HCM';
  if (normalized.includes('đà nẵng') || normalized.includes('da nang')) return 'Đà Nẵng';
  if (normalized.includes('hải phòng') || normalized.includes('hai phong')) return 'Hải Phòng';
  if (normalized.includes('huế') || normalized.includes('hue')) return 'Huế';
  const parts = venue.split(',');
  return parts[parts.length - 1]?.trim() || (locale === 'vi' ? 'Việt Nam' : 'Vietnam');
}

function toDisplayEvent(e: Event, locale: Locale): DisplayEvent {
  const date = new Date(e.event_date);
  const pad = (n: number) => String(n).padStart(2, '0');
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
    category: categoryLabel(locale, e.category),
    categoryKey: e.category,
    venue: e.venue,
    city: deriveCityFromVenue(e.venue, locale),
    date: e.event_date,
    dateLabel: new Intl.DateTimeFormat(localeTag(locale), {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }).format(date),
    timeLabel: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    poster: e.poster_url || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80',
    priceFrom: e.min_price ?? 0,
    priceTo: e.max_price ?? e.min_price ?? 0,
    soldPercent,
    badge,
  };
}

function parseTimeRange(value: string | null): TimeRangeKey {
  const valid: TimeRangeKey[] = ['all', 'today', 'weekend', 'week', 'month', 'next_month', 'other'];
  return valid.includes(value as TimeRangeKey) ? (value as TimeRangeKey) : 'all';
}

function parseCity(value: string | null): string {
  const valid = ['Tất cả', 'Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Huế', 'Khác'];
  return value && valid.includes(value) ? value : 'Tất cả';
}

function parsePriceMax(value: string | null): number {
  const price = Number(value);
  return Number.isFinite(price) && price > 0 && price <= DEFAULT_PRICE_MAX ? price : DEFAULT_PRICE_MAX;
}

function toApiCity(value: string): 'ha-noi' | 'ho-chi-minh' | 'da-nang' | 'hai-phong' | 'hue' | 'other' | undefined {
  if (value === 'Hà Nội') return 'ha-noi';
  if (value === 'TP. HCM') return 'ho-chi-minh';
  if (value === 'Đà Nẵng') return 'da-nang';
  if (value === 'Hải Phòng') return 'hai-phong';
  if (value === 'Huế') return 'hue';
  if (value === 'Khác') return 'other';
  return undefined;
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
  const { locale, messages } = useLocale();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('search')?.trim() ?? '';
    const initialCategory = params.get('category');

    setSearchInput(initialQuery);
    setQuery(initialQuery);
    setActiveCat(isEventCategory(initialCategory) ? initialCategory : null);
    setSort(parseSort(params.get('sort')));
    const initialTime = parseTimeRange(params.get('time'));
    const initialCity = parseCity(params.get('city'));
    const initialPrice = parsePriceMax(params.get('maxPrice'));
    setStagedTime(initialTime);
    setTimeRange(initialTime);
    setStagedCity(initialCity);
    setCity(initialCity);
    setStagedPriceMax(initialPrice);
    setPriceMax(initialPrice);
    setCurrentPage(parsePage(params.get('page')));
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (activeCat) params.set('category', activeCat);
    if (sort !== 'trending') params.set('sort', sort);
    if (timeRange !== 'all') params.set('time', timeRange);
    if (city !== 'Tất cả') params.set('city', city);
    if (priceMax < DEFAULT_PRICE_MAX) params.set('maxPrice', String(priceMax));
    if (currentPage > 1) params.set('page', String(currentPage));

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [activeCat, city, currentPage, pathname, priceMax, query, router, sort, timeRange, urlReady]);

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
      const apiSort = sort === 'newest'
        ? 'created_at'
        : sort === 'trending'
          ? 'sold'
          : sort === 'priceAsc' || sort === 'priceDesc'
            ? 'price'
            : 'event_date';
      const apiOrder = sort === 'newest' || sort === 'trending' || sort === 'priceDesc' ? 'desc' : 'asc';
      const result = await listEvents({
        search: query || undefined,
        category: activeCat ?? undefined,
        city: toApiCity(city),
        time_range: timeRange === 'all' ? undefined : timeRange,
        max_price: priceMax < DEFAULT_PRICE_MAX ? priceMax : undefined,
        sort: apiSort,
        order: apiOrder,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setApiEvents(result.events.map((item) => toDisplayEvent(item, locale)));
      setTotalPages(Math.max(1, result.pagination.total_pages));
      setTotalCount(result.pagination.total);
    } catch {
      setApiEvents([]);
      setTotalPages(1);
      setTotalCount(0);
      setError(messages.events.loadError);
    } finally {
      setLoading(false);
    }
  }, [query, activeCat, city, timeRange, priceMax, sort, currentPage, locale, messages.events.loadError]);

  useEffect(() => {
    if (!urlReady) return;
    void fetchEvents();
  }, [fetchEvents, urlReady]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeCat, city, timeRange, priceMax, sort]);

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
            ) : apiEvents.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {apiEvents.map((ev) => (
                  <EventCardCompact key={ev.id} event={ev} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {apiEvents.map((ev) => (
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
  const { messages } = useLocale();

  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white py-20 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-stone-100">
        <Search className="h-7 w-7 text-stone-400" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{messages.events.noMatch}</h3>
      <p className="mt-1 text-sm text-stone-500">{messages.events.noMatchDesc}</p>
      <button
        onClick={onReset}
        className="mt-4 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600"
      >
        {messages.events.resetFilters}
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { messages } = useLocale();

  return (
    <div className="rounded-3xl border border-red-100 bg-white py-20 text-center shadow-soft">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{messages.events.loadErrorTitle}</h3>
      <p className="mt-1 text-sm text-stone-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-800"
      >
        {messages.common.retry}
      </button>
    </div>
  );
}
