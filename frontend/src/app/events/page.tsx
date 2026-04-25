'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { type CategoryKey } from '@/data/uiConfig';
import type { DisplayEvent } from '@/types';
import { listEvents } from '@/lib/api/events';
import { toDisplayEvent } from '@/lib/utils/eventMappers';
import {
  DEFAULT_PRICE_MAX, PAGE_SIZE,
  type SortKey, type TimeRangeKey, type ViewMode,
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

function filterByTimeRange(events: DisplayEvent[], range: TimeRangeKey): DisplayEvent[] {
  if (range === 'all') return events;
  const now = Date.now();
  return events.filter((e) => {
    const t = new Date(e.date).getTime();
    if (range === 'today')   return t >= now && t <= now + DAY_MS;
    if (range === 'weekend') { const d = new Date(e.date).getDay(); return d === 0 || d === 6; }
    if (range === 'week')    return t >= now && t <= now + 7 * DAY_MS;
    if (range === 'month')   return t >= now && t <= now + 30 * DAY_MS;
    return true;
  });
}

function sortEvents(events: DisplayEvent[], sort: SortKey): DisplayEvent[] {
  if (sort === 'priceAsc')  return [...events].sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
  if (sort === 'priceDesc') return [...events].sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
  return events;
}

export default function EventsListingPage() {
  // API state
  const [apiEvents, setApiEvents] = useState<DisplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search — draft vs applied
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');

  // Category — single select
  const [activeCat, setActiveCat] = useState<CategoryKey | null>(null);

  // Sidebar filters: staged (inputs) vs applied (drives results)
  const [stagedTime, setStagedTime] = useState<TimeRangeKey>('all');
  const [stagedCity, setStagedCity] = useState('Tất cả');
  const [stagedPriceMax, setStagedPriceMax] = useState(DEFAULT_PRICE_MAX);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('all');
  const [city, setCity] = useState('Tất cả');
  const [priceMax, setPriceMax] = useState(DEFAULT_PRICE_MAX);

  // Immediate (non-staged) controls
  const [sort, setSort] = useState<SortKey>('trending');
  const [view, setView] = useState<ViewMode>('grid');

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

  // Fetch — driven by server-side filters (query, category, sort, page)
  const fetchEvents = useCallback(async () => {
    setLoading(true);
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
      setTotalPages(result.pagination.total_pages);
      setTotalCount(result.pagination.total);
    } catch {
      setApiEvents([]);
    } finally {
      setLoading(false);
    }
  }, [query, activeCat, sort, currentPage]);

  useEffect(() => { void fetchEvents(); }, [fetchEvents]);
  useEffect(() => { setCurrentPage(1); }, [query, activeCat, sort]);

  // Handlers
  const submitSearch = () => setQuery(searchInput.trim());
  const clearSearch = () => setQuery('');

  const selectCategory = (k: CategoryKey) =>
    setActiveCat((prev) => (prev === k ? null : k));

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

  const clearTime  = () => { setStagedTime('all');         setTimeRange('all'); };
  const clearCity  = () => { setStagedCity('Tất cả');      setCity('Tất cả'); };
  const clearPrice = () => { setStagedPriceMax(DEFAULT_PRICE_MAX); setPriceMax(DEFAULT_PRICE_MAX); };

  const resetFilters = () => {
    setActiveCat(null);
    clearTime();
    clearCity();
    clearPrice();
    setSearchInput(''); setQuery('');
    setCurrentPage(1);
  };

  // Client-side refinement (city / time / price / price-sort)
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
                onClearQuery={() => { setSearchInput(''); setQuery(''); }}
                onClearCategory={() => setActiveCat(null)}
                onClearTime={clearTime}
                onClearCity={clearCity}
                onClearPrice={clearPrice}
                onResetAll={resetFilters}
              />
            )}

            {loading ? (
              <EventsListSkeleton view={view} />
            ) : filtered.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((ev) => <EventCardCompact key={ev.id} event={ev} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((ev) => <EventCardList key={ev.id} event={ev} />)}
              </div>
            )}

            {!loading && (
              <EventsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
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
      <p className="mt-1 text-sm text-stone-500">Thử bỏ bớt bộ lọc hoặc đổi từ khóa khác</p>
      <button
        onClick={onReset}
        className="mt-4 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
}
