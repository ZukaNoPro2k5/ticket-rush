'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Calendar, Clock, ChevronDown, ChevronRight,
  Grid3x3, List, SlidersHorizontal, X, ArrowUpDown, Ticket,
  ArrowRight, Flame,
} from 'lucide-react';
import {
  CATEGORIES, THIS_WEEK_EVENTS, formatVnd, type MockEvent, type CategoryKey,
} from '@/lib/mockHomeData';

type SortKey = 'trending' | 'newest' | 'upcoming' | 'priceAsc' | 'priceDesc';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'trending', label: 'Phổ biến nhất' },
  { key: 'newest',   label: 'Mới nhất' },
  { key: 'upcoming', label: 'Sắp diễn ra' },
  { key: 'priceAsc', label: 'Giá: Thấp → Cao' },
  { key: 'priceDesc', label: 'Giá: Cao → Thấp' },
];

const CITIES = ['Tất cả', 'Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Huế'];

const TIME_RANGES = [
  { key: 'all',     label: 'Tất cả thời gian' },
  { key: 'today',   label: 'Hôm nay' },
  { key: 'weekend', label: 'Cuối tuần' },
  { key: 'week',    label: 'Tuần này' },
  { key: 'month',   label: 'Tháng này' },
] as const;

// Expand mock dataset
const ALL_EVENTS: MockEvent[] = [...THIS_WEEK_EVENTS, ...THIS_WEEK_EVENTS.map((e) => ({ ...e, id: e.id + 1000 }))];

// ─── Mini navbar for listing page ───────────────────────
function ListingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-stone-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white shadow-lift">
            <Ticket className="h-5 w-5" strokeWidth={2.5} />
          </span>
          TicketRush
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">Trang chủ</Link>
          <Link href="/events" className="rounded-lg bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-900">Sự kiện</Link>
          <Link href="#" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">Tổ chức sự kiện</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="#" className="hidden rounded-full px-4 py-2 text-sm font-medium text-stone-700 sm:inline-block">Đăng nhập</Link>
          <Link href="#" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift">
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Card (grid view) ───────────────────────────────────
function EventCardCompact({ event }: { event: MockEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.poster} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-900/70 to-transparent" />
        {event.badge === 'hot' && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lift">
            <Flame className="h-3 w-3" /> HOT
          </span>
        )}
        {event.badge === 'almost-sold' && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lift">Sắp cháy vé</span>
        )}
        {event.badge === 'new' && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lift">MỚI</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">{event.category}</span>
        <h3 className="mt-1 line-clamp-2 font-semibold text-stone-900 group-hover:text-amber-700">{event.title}</h3>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.dateLabel}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {event.timeLabel}</span>
        </div>
        <div className="mt-1.5 line-clamp-1 text-xs text-stone-500"><MapPin className="mr-0.5 inline h-3 w-3" /> {event.venue}</div>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400">Từ</div>
            <div className="font-display text-base font-bold text-amber-700">{formatVnd(event.priceFrom)}</div>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors group-hover:bg-amber-500 group-hover:text-white">Xem vé</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Card (list view — horizontal) ─────────────────────
function EventCardList({ event }: { event: MockEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="group flex gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] w-40 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-56">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.poster} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col py-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">{event.category}</span>
        <h3 className="mt-0.5 line-clamp-2 font-display text-lg font-bold text-stone-900 group-hover:text-amber-700">{event.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {event.dateLabel} · {event.timeLabel}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.venue}, {event.city}</span>
        </div>
        <div className="mt-2 max-w-xs">
          <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
            <span>Đã bán {event.soldPercent}%</span>
            {event.soldPercent >= 80 && <span className="font-semibold text-orange-600">Sắp cháy vé</span>}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-stone-100">
            <div className={`h-full rounded-full ${event.soldPercent >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`} style={{ width: `${event.soldPercent}%` }} />
          </div>
        </div>
        <div className="mt-auto pt-2 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400">Từ</div>
            <div className="font-display text-lg font-bold text-amber-700">{formatVnd(event.priceFrom)}</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-soft transition-all group-hover:-translate-y-0.5 group-hover:bg-amber-600">
            Chọn vé <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ───────────────────────────────────────────────
export default function EventsListingPage() {
  const [q, setQ] = useState('');
  const [activeCats, setActiveCats] = useState<Set<CategoryKey>>(new Set());
  const [timeRange, setTimeRange] = useState<typeof TIME_RANGES[number]['key']>('all');
  const [city, setCity] = useState('Tất cả');
  const [priceMax, setPriceMax] = useState(5_000_000);
  const [sort, setSort] = useState<SortKey>('trending');
  const [view, setView] = useState<ViewMode>('grid');

  const toggleCat = (k: CategoryKey) => {
    setActiveCats((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  };
  const resetFilters = () => {
    setActiveCats(new Set());
    setTimeRange('all');
    setCity('Tất cả');
    setPriceMax(5_000_000);
    setQ('');
  };

  const filtered = useMemo(() => {
    let arr = ALL_EVENTS.slice();
    if (q.trim()) arr = arr.filter((e) => e.title.toLowerCase().includes(q.toLowerCase()) || e.venue.toLowerCase().includes(q.toLowerCase()));
    if (activeCats.size) arr = arr.filter((e) => activeCats.has(e.categoryKey));
    if (city !== 'Tất cả') arr = arr.filter((e) => e.city === city);
    arr = arr.filter((e) => e.priceFrom <= priceMax);

    switch (sort) {
      case 'newest':    arr.sort((a, b) => b.id - a.id); break;
      case 'upcoming':  arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); break;
      case 'priceAsc':  arr.sort((a, b) => a.priceFrom - b.priceFrom); break;
      case 'priceDesc': arr.sort((a, b) => b.priceFrom - a.priceFrom); break;
      default:          arr.sort((a, b) => (b.velocity ?? 0) - (a.velocity ?? 0));
    }
    return arr;
  }, [q, activeCats, city, priceMax, sort]);

  const activeFilterCount = activeCats.size + (timeRange !== 'all' ? 1 : 0) + (city !== 'Tất cả' ? 1 : 0) + (priceMax < 5_000_000 ? 1 : 0);

  return (
    <main className="min-h-screen bg-stone-50">
      <ListingNavbar />

      {/* Compact hero */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-stone-900 text-white">
        <div className="absolute inset-0 bg-mesh-warm opacity-90" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-stone-300">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <ChevronRight className="h-3.5 w-3.5 text-stone-500" />
            <span className="text-white">Sự kiện</span>
          </nav>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Khám phá sự kiện</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-300 md:text-base">Hơn 1,200 sự kiện đang mở bán — từ concert, workshop, đến thể thao. Lọc theo sở thích và đặt vé chỉ trong 30 giây.</p>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-md">
            <Search className="ml-2 h-5 w-5 text-white/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nhập tên sự kiện, nghệ sĩ, địa điểm…"
              className="flex-1 bg-transparent text-white placeholder:text-white/60 outline-none"
            />
            <button className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600">Tìm kiếm</button>
          </div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section className="sticky top-16 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Lọc:
            </span>
            {CATEGORIES.map((c) => {
              const active = activeCats.has(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => toggleCat(c.key)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all
                    ${active
                      ? 'border-amber-500 bg-amber-500 text-white shadow-soft'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    }`}
                >
                  <i className={`${c.icon} text-xs`} aria-hidden />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-[160px] space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-stone-900">Bộ lọc nâng cao</h3>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-xs font-medium text-amber-700 hover:text-amber-800">Xóa tất cả</button>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Thời gian</label>
                <div className="space-y-1.5">
                  {TIME_RANGES.map((t) => (
                    <label key={t.key} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="time" checked={timeRange === t.key} onChange={() => setTimeRange(t.key)} className="accent-amber-500" />
                      <span className="text-stone-700">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">Thành phố</label>
                <div className="relative">
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full appearance-none rounded-lg border border-stone-200 bg-white px-3 py-2 pr-8 text-sm focus:border-amber-500 focus:outline-none">
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Giá tối đa</label>
                  <span className="text-xs font-semibold text-amber-700">{formatVnd(priceMax)}</span>
                </div>
                <input
                  type="range" min={100_000} max={5_000_000} step={50_000}
                  value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="mt-1 flex justify-between text-[10px] text-stone-400">
                  <span>100K</span><span>5tr</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            {/* Result bar */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-stone-600">
                Tìm thấy <span className="font-bold text-stone-900">{filtered.length}</span> sự kiện
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 appearance-none rounded-full border border-stone-200 bg-white pl-9 pr-8 text-sm font-medium text-stone-700 focus:border-amber-500 focus:outline-none">
                    {SORT_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                </div>
                <div className="flex h-10 items-center gap-0.5 rounded-full border border-stone-200 bg-white p-0.5">
                  <button onClick={() => setView('grid')} className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${view === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'}`}>
                    <Grid3x3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setView('list')} className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${view === 'list' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'}`}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active chips */}
            {activeFilterCount > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {Array.from(activeCats).map((k) => {
                  const cat = CATEGORIES.find((c) => c.key === k);
                  if (!cat) return null;
                  return (
                    <button key={k} onClick={() => toggleCat(k)} className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-200">
                      {cat.label} <X className="h-3 w-3" />
                    </button>
                  );
                })}
                {city !== 'Tất cả' && (
                  <button onClick={() => setCity('Tất cả')} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200">
                    <MapPin className="h-3 w-3" /> {city} <X className="h-3 w-3" />
                  </button>
                )}
                {priceMax < 5_000_000 && (
                  <button onClick={() => setPriceMax(5_000_000)} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200">
                    ≤ {formatVnd(priceMax)} <X className="h-3 w-3" />
                  </button>
                )}
                <button onClick={resetFilters} className="text-xs font-medium text-amber-700 hover:text-amber-800">Xóa tất cả</button>
              </div>
            )}

            {/* Results */}
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white py-20 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-stone-100">
                  <Search className="h-7 w-7 text-stone-400" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">Không tìm thấy sự kiện phù hợp</h3>
                <p className="mt-1 text-sm text-stone-500">Thử bỏ bớt bộ lọc hoặc đổi từ khóa khác</p>
                <button onClick={resetFilters} className="mt-4 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600">Xóa bộ lọc</button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((ev) => <EventCardCompact key={ev.id} event={ev} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((ev) => <EventCardList key={ev.id} event={ev} />)}
              </div>
            )}

            {/* Pagination (static preview) */}
            {filtered.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-900">‹</button>
                {[1, 2, 3].map((n) => (
                  <button key={n} className={`h-10 min-w-10 rounded-full px-3 text-sm font-semibold ${n === 1 ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'}`}>{n}</button>
                ))}
                <span className="px-1 text-stone-400">…</span>
                <button className="h-10 min-w-10 rounded-full border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700 hover:border-stone-400">12</button>
                <button className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-500 hover:border-stone-400 hover:text-stone-900">›</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
