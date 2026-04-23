'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Globe, ChevronDown, ChevronLeft, ChevronRight,
  Calendar, Clock, ArrowRight, Flame, Sparkles, TrendingUp, ShieldCheck,
  RotateCcw, Headphones, Menu, X, User as UserIcon, LogOut, Ticket,
  Tag, Newspaper,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
  HERO_SLIDES, CATEGORIES, THIS_WEEK_EVENTS,
  TRENDING_LEADERBOARD, FOR_YOU_EVENTS, NEW_EVENTS, TIME_TABS,
  TRUST_SIGNALS, FOOTER_LINKS, NEWS_ARTICLES, formatVnd,
  type MockEvent, type TimeTabKey,
} from '@/lib/mockHomeData';

// ─────────────────────────────────────────────────────────────
// EventCalendar — month grid with event indicators + day list
// ─────────────────────────────────────────────────────────────
function EventCalendar({ onClose }: { onClose: () => void }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selected, setSelected] = useState<number | null>(null);

  const eventsByDay = useMemo(() => {
    const map: Record<number, { hot: boolean; events: MockEvent[] }> = {};
    const baseDays = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29];
    baseDays.forEach((d, i) => {
      const start = (i * 2) % THIS_WEEK_EVENTS.length;
      const slice = THIS_WEEK_EVENTS.slice(start, start + 2 + (i % 2));
      map[d] = { hot: i % 3 === 0, events: slice };
    });
    // inject a "crowded" day to demo overflow handling
    map[17] = { hot: true, events: THIS_WEEK_EVENTS.slice(0, 8) };
    return map;
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayRaw = new Date(year, month, 1).getDay();
  const leading = firstDayRaw === 0 ? 6 : firstDayRaw - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells: (number | null)[] = [
    ...Array(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const goPrev = () => { setViewDate(new Date(year, month - 1, 1)); setSelected(null); };
  const goNext = () => { setViewDate(new Date(year, month + 1, 1)); setSelected(null); };
  const goToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelected(now.getDate());
  };

  const selectedMeta = selected != null ? eventsByDay[selected] : undefined;
  const selectedEvents = selectedMeta?.events ?? [];

  return (
    <div className="absolute left-1/2 top-full z-50 mt-3 w-[440px] max-w-[calc(100vw-2rem)] -translate-x-1/2 animate-slideDown overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lift">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-white px-5 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">Lịch sự kiện</div>
            <div className="mt-0.5 font-display text-lg font-bold capitalize text-stone-900">{monthLabel}</div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={goToday} className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600 transition-colors hover:border-amber-300 hover:text-amber-700">Hôm nay</button>
            <button onClick={goPrev} aria-label="Tháng trước" className="grid h-8 w-8 place-items-center rounded-full text-stone-600 transition-colors hover:bg-white hover:text-stone-900"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={goNext} aria-label="Tháng sau" className="grid h-8 w-8 place-items-center rounded-full text-stone-600 transition-colors hover:bg-white hover:text-stone-900"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="mb-1 grid grid-cols-7 gap-1 pt-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone-400">
          {weekdays.map((w, i) => <div key={w} className={i === 6 ? 'text-rose-400' : ''}>{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, idx) => {
            if (d == null) return <div key={idx} />;
            const meta = eventsByDay[d];
            const sel = selected === d;
            const td = isToday(d);
            const isSunday = (idx % 7) === 6;
            const count = meta?.events.length ?? 0;
            return (
              <button
                key={idx}
                onClick={() => setSelected(sel ? null : d)}
                className={`group relative flex h-11 flex-col items-center justify-center rounded-lg text-sm font-semibold transition-all
                  ${sel
                    ? 'bg-amber-500 text-white shadow-soft scale-[1.03]'
                    : td
                      ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-300'
                      : meta
                        ? 'text-stone-800 hover:bg-amber-50'
                        : `${isSunday ? 'text-rose-400' : 'text-stone-400'} hover:bg-stone-100`}`}
              >
                <span className={meta && !sel ? 'leading-none' : 'leading-none'}>{d}</span>
                {meta && (
                  <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5">
                    {meta.hot && <span className={`h-1 w-1 rounded-full ${sel ? 'bg-white' : 'bg-rose-500 animate-pulse'}`} />}
                    <span className={`h-1 w-1 rounded-full ${sel ? 'bg-white' : 'bg-amber-500'}`} />
                    {count > 3 && <span className={`h-1 w-1 rounded-full ${sel ? 'bg-white' : 'bg-amber-500'}`} />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-500">
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Có sự kiện</span>
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Có sự kiện hot</span>
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-stone-300" /> 3+ sự kiện</span>
        </div>
      </div>

      {/* Day detail panel */}
      {selected != null && (
        <div className="animate-slideDown border-t border-stone-200 bg-stone-50/60">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Ngày {selected}</div>
              <div className="text-sm font-semibold text-stone-900">
                {selectedEvents.length > 0 ? `${selectedEvents.length} sự kiện diễn ra` : 'Không có sự kiện'}
              </div>
            </div>
            <button onClick={() => setSelected(null)} aria-label="Đóng" className="grid h-7 w-7 place-items-center rounded-full text-stone-400 transition-colors hover:bg-white hover:text-stone-700"><X className="h-3.5 w-3.5" /></button>
          </div>
          {selectedEvents.length > 0 && (
            <ul className="max-h-64 divide-y divide-stone-200/80 overflow-y-auto bg-white">
              {selectedEvents.slice(0, 5).map((ev) => (
                <li key={ev.id}>
                  <Link href={`/events/${ev.id}`} onClick={onClose} className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-amber-50">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 ring-1 ring-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ev.poster} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-medium text-stone-900 group-hover:text-amber-700">{ev.title}</div>
                      <div className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">
                        <Clock className="mr-0.5 inline h-3 w-3" /> {ev.timeLabel} · {ev.venue}
                      </div>
                    </div>
                    {ev.badge === 'hot' && (
                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600">Hot</span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600" />
                  </Link>
                </li>
              ))}
              {selectedEvents.length > 5 && (
                <li>
                  <Link
                    href={`/events?date=${selected}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 bg-amber-50/50 px-5 py-2.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    Xem tất cả {selectedEvents.length} sự kiện <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Navbar — transparent on hero, blurs solid after scroll > 80
// ─────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const shellCls = scrolled
    ? 'bg-white/85 backdrop-blur-md shadow-soft border-b border-stone-200/70'
    : 'bg-transparent';

  const linkCls = scrolled ? 'text-stone-700 hover:text-stone-900' : 'text-white/90 hover:text-white';
  const logoCls = scrolled ? 'text-stone-900' : 'text-white';

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${shellCls}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 lg:h-20 lg:px-8">
        {/* Logo */}
        <Link href="/" className={`flex items-center gap-2 font-display text-xl font-bold ${logoCls}`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white shadow-lift">
            <Ticket className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span>TicketRush</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <div className="relative">
            <button
              onClick={() => setExploreOpen((v) => !v)}
              onBlur={() => setTimeout(() => setExploreOpen(false), 150)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${linkCls}`}
            >
              Khám phá <ChevronDown className="h-4 w-4" />
            </button>
            {exploreOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 animate-slideDown rounded-2xl border border-stone-200 bg-white p-2 shadow-lift">
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.key}
                      href={`/events?category=${c.key}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
                    >
                      <i className={`${c.icon} text-stone-500 w-4`} aria-hidden /> {c.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-1 border-t border-stone-200 pt-1">
                  <Link href="/events" className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50">
                    Tất cả sự kiện <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setCalOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${linkCls}`}
            >
              <Calendar className="h-4 w-4" /> Lịch sự kiện <ChevronDown className="h-4 w-4" />
            </button>
            {calOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCalOpen(false)} />
                <EventCalendar onClose={() => setCalOpen(false)} />
              </>
            )}
          </div>
          <Link href="#" className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${linkCls}`}>
            <Tag className="h-4 w-4" /> Kho voucher
          </Link>
          <Link href="#" className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${linkCls}`}>
            <Newspaper className="h-4 w-4" /> Tin tức
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1">
          {/* Search icon — opens /events focused on search */}
          <Link
            href="/events"
            aria-label="Tìm kiếm sự kiện"
            className={`hidden h-10 w-10 place-items-center rounded-full transition-colors md:grid ${linkCls} ${scrolled ? 'hover:bg-stone-100' : 'hover:bg-white/10'}`}
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          {/* Language */}
          <button className={`hidden h-10 items-center gap-1 rounded-full px-2.5 text-sm font-medium transition-colors lg:flex ${linkCls} ${scrolled ? 'hover:bg-stone-100' : 'hover:bg-white/10'}`}>
            <Globe className="h-4 w-4" /> VN
          </button>

          {/* Auth */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors
                  ${scrolled ? 'border-stone-200 text-stone-800 hover:bg-stone-100' : 'border-white/30 text-white hover:bg-white/10'}`}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden md:inline max-w-[120px] truncate">{user.full_name.split(' ').pop()}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 animate-slideDown rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lift">
                  <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"><UserIcon className="h-4 w-4" /> Tài khoản</Link>
                  <Link href="#" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"><Ticket className="h-4 w-4" /> Vé của tôi</Link>
                  <button onClick={clearAuth} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"><LogOut className="h-4 w-4" /> Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="#"
              className="hidden rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift sm:inline-block"
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(true)} className={`grid h-10 w-10 place-items-center rounded-lg lg:hidden ${linkCls}`}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] animate-slideDown bg-white p-6 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg font-bold">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-stone-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-100 px-3 py-2">
              <Search className="h-4 w-4 text-stone-400" />
              <input placeholder="Tìm sự kiện…" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
            <nav className="space-y-1 text-sm font-medium">
              {CATEGORIES.map((c) => (
                <Link key={c.key} href={`/events?category=${c.key}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-stone-700 hover:bg-stone-100">
                  <i className={`${c.icon} w-5 text-stone-500`} aria-hidden /> {c.label}
                </Link>
              ))}
              <Link href="/events" className="mt-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2.5 font-semibold text-amber-700">
                Tất cả sự kiện <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
            {!isAuthenticated && (
              <div className="mt-6 space-y-2">
                <Link href="#" className="block rounded-full border border-stone-300 py-2.5 text-center text-sm font-medium">Đăng nhập</Link>
                <Link href="#" className="block rounded-full bg-amber-500 py-2.5 text-center text-sm font-semibold text-white">Đăng ký</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// Hero — full-bleed carousel, side arrows centered, scroll cue
// ─────────────────────────────────────────────────────────────
function Hero() {
  const [active, setActive] = useState(0);
  const slide = HERO_SLIDES[active];

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % HERO_SLIDES.length), 7000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setActive((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => setActive((i) => (i + 1) % HERO_SLIDES.length);

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      {/* Image stack with crossfade */}
      {HERO_SLIDES.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.id}
          src={s.image}
          alt={s.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/55 to-stone-900/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/65 to-transparent md:via-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-44 pt-24 sm:pb-52 lg:px-8">
        <div key={slide.id} className="max-w-2xl animate-fadeInUp text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-lift">
            <Flame className="h-3.5 w-3.5" /> {slide.badge}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl md:mt-4 md:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-2 text-base font-medium text-amber-200 sm:text-lg md:text-xl">{slide.subtitle}</p>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/80 sm:mt-3 md:text-base">{slide.tagline}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-amber-300" /> {slide.date}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-amber-300" /> {slide.venue}</span>
          </div>

          <div className="mt-5">
            <Link href={`/events/${slide.id}`} className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-600 sm:px-6 sm:py-3 sm:text-base">
              Chi tiết <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Side nav arrows — vertically centered */}
      <button
        onClick={prev}
        aria-label="Slide trước"
        className="group absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:grid lg:left-6"
      >
        <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={next}
        aria-label="Slide sau"
        className="group absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:grid lg:right-6"
      >
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Bottom overlay: thumbnail indicators + scroll cue "Hơn thế nữa" */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-stone-950/85 via-stone-950/55 to-transparent pb-3 pt-10 sm:pb-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Thumbnail row — slide indicators that double as navigation */}
          <div className="hidden grid-cols-6 gap-2 sm:grid sm:gap-3">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                aria-label={`Đến slide ${i + 1}: ${s.title}`}
                className={`group relative aspect-[16/10] overflow-hidden rounded-xl border-2 text-left transition-all duration-300
                  ${i === active ? 'border-amber-400 shadow-lift' : 'border-white/15 opacity-70 hover:border-white/50 hover:opacity-100'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/20 to-transparent" />
                <div className="absolute inset-x-2 bottom-1.5">
                  <div className="line-clamp-1 text-[11px] font-semibold text-white">{s.title}</div>
                  <div className="mt-0.5 line-clamp-1 text-[10px] text-white/70">{s.date.split(' · ').slice(0, 2).join(' · ')}</div>
                </div>
                {i === active && <span className="absolute inset-x-0 top-0 h-0.5 bg-amber-400" />}
              </button>
            ))}
          </div>

          {/* Mobile dots */}
          <div className="flex justify-center gap-1.5 sm:hidden">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Đến slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>

          {/* "Hơn thế nữa" scroll cue — below thumbnails */}
          <div className="mt-3 flex justify-center sm:mt-4">
            <button
              onClick={() => {
                const el = document.getElementById('home-categories');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              aria-label="Cuộn xuống xem thêm"
              className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-amber-300/60 hover:bg-white/20 hover:text-white"
            >
              <span>Hơn thế nữa</span>
              <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Categories grid
// ─────────────────────────────────────────────────────────────
function CategoriesGrid() {
  return (
    <section id="home-categories" className="scroll-mt-20 bg-stone-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Khám phá theo chủ đề</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Chọn lĩnh vực bạn yêu thích để tìm sự kiện nhanh hơn</p>
          </div>
          <Link href="/events" className="hidden items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 md:inline-flex">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="stagger-children grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/events?category=${c.key}`}
              className="group rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-stone-300 hover:shadow-lift"
            >
              <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-4 transition-transform duration-300 group-hover:scale-110 ${c.accent} ${c.ring}`}>
                <i className={`${c.icon} text-xl`} aria-hidden />
              </div>
              <div className="mt-3 font-semibold text-stone-900">{c.label}</div>
              <div className="mt-0.5 text-xs text-stone-500">{c.count} sự kiện</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable Event Card
// ─────────────────────────────────────────────────────────────
function EventCard({ event }: { event: MockEvent }) {
  const badgeMap: Record<NonNullable<MockEvent['badge']>, { label: string; cls: string }> = {
    'hot':           { label: 'HOT',          cls: 'bg-rose-500 text-white' },
    'new':           { label: 'MỚI',          cls: 'bg-amber-500 text-white' },
    'almost-sold':   { label: 'SẮP CHÁY VÉ',  cls: 'bg-orange-600 text-white' },
    'special':       { label: 'ĐẶC BIỆT',     cls: 'bg-purple-600 text-white' },
  };
  const badge = event.badge ? badgeMap[event.badge] : null;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.poster} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-900/70 to-transparent" />
        {badge && (
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lift ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-700 backdrop-blur-md">
          <i className={`${CATEGORIES.find((c) => c.key === event.categoryKey)?.icon ?? 'fa-solid fa-tag'} text-amber-600`} aria-hidden />
          {event.category}
        </span>
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-xs text-white">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {event.dateLabel}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {event.timeLabel}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[3rem] font-semibold leading-snug text-stone-900 transition-colors group-hover:text-amber-700">{event.title}</h3>
        <div className="mt-1.5 line-clamp-1 text-sm text-stone-500">
          <MapPin className="mr-1 inline h-3.5 w-3.5" /> {event.venue}
        </div>

        <div className="mt-auto pt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
            <span>Đã bán {event.soldPercent}%</span>
            {event.soldPercent >= 80 && <span className="font-semibold text-orange-600">Sắp cháy vé</span>}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-stone-100">
            <div className={`h-full rounded-full transition-all duration-500 ${event.soldPercent >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`} style={{ width: `${event.soldPercent}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Horizontal scroll section with arrows + tabs
// ─────────────────────────────────────────────────────────────
function ThisWeekSection() {
  const [tab, setTab] = useState<TimeTabKey>('week');

  const events = useMemo(() => {
    const all = THIS_WEEK_EVENTS;
    if (tab === 'today') return all.slice(0, 4);
    if (tab === 'weekend') return all.filter((_, i) => i % 2 === 0).slice(0, 8);
    if (tab === 'month') return all.slice(0, 8);
    return all.slice(0, 8);
  }, [tab]);

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Calendar className="h-3.5 w-3.5" /> Sẽ diễn ra
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Sự kiện sắp diễn ra</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Đặt vé sớm — giá tốt nhất, chỗ đẹp nhất</p>
          </div>
          <Link href="/events" className="hidden items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 md:inline-flex">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {TIME_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all
                ${tab === t.key
                  ? 'bg-stone-900 text-white shadow-lift'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="stagger-children grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Hybrid Trending Leaderboard — table rows with poster + velocity
// ─────────────────────────────────────────────────────────────
function TrendingLeaderboard() {
  return (
    <section className="bg-stone-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700">
              <Flame className="h-3.5 w-3.5" /> Bảng xếp hạng
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Đang được tìm nhiều nhất</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Cập nhật theo lượng đặt vé 24 giờ qua</p>
          </div>
          <Link href="/events?sort=trending" className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800">
            Xem đầy đủ <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft">
          {/* Table header (desktop) */}
          <div className="hidden border-b border-stone-200 bg-stone-50 px-6 py-3 md:grid md:grid-cols-[60px_1fr_180px_180px_120px] md:gap-4 md:text-xs md:font-bold md:uppercase md:tracking-wider md:text-stone-500">
            <span>Hạng</span>
            <span>Sự kiện</span>
            <span>Thời gian</span>
            <span>Tốc độ bán (24h)</span>
            <span className="text-right">Giá từ</span>
          </div>

          {TRENDING_LEADERBOARD.map((ev, i) => {
            const rank = i + 1;
            const change = ev.rankChange ?? 0;
            const velocity = Math.min(ev.velocity ?? 0, 40);
            return (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="group grid items-center gap-3 border-b border-stone-100 px-4 py-4 transition-colors last:border-b-0 hover:bg-amber-50/50 md:grid-cols-[60px_1fr_180px_180px_120px] md:gap-4 md:px-6"
              >
                {/* Rank */}
                <div className="flex items-center gap-2">
                  <span className={`font-display text-2xl font-bold tabular-nums md:text-3xl
                    ${rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-stone-400' : rank === 3 ? 'text-orange-700' : 'text-stone-300'}`}>
                    #{rank}
                  </span>
                  {change !== 0 && (
                    <span className={`hidden text-[10px] font-bold tabular-nums md:inline ${change > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {change > 0 ? '▲' : '▼'}{Math.abs(change)}
                    </span>
                  )}
                </div>

                {/* Event info */}
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 md:h-16 md:w-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ev.poster} alt={ev.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 font-semibold text-stone-900 group-hover:text-amber-700">{ev.title}</h3>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                      <span className="line-clamp-1"><MapPin className="mr-0.5 inline h-3 w-3" /> {ev.venue}</span>
                    </div>
                    {/* Mobile: time + velocity */}
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-stone-500 md:hidden">
                      <span>{ev.dateLabel}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <TrendingUp className="h-3 w-3" /> +{ev.velocity}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Time (desktop) */}
                <div className="hidden text-sm text-stone-700 md:block">
                  <div className="font-medium">{ev.dateLabel}</div>
                  <div className="text-xs text-stone-500">{ev.timeLabel} · {ev.city}</div>
                </div>

                {/* Velocity bar (desktop) */}
                <div className="hidden md:block">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-emerald-600 inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +{ev.velocity}%</span>
                    <span className="text-stone-400">{ev.soldPercent}% bán</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500" style={{ width: `${(velocity / 40) * 100}%` }} />
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Từ</div>
                  <div className="font-display text-base font-bold text-amber-700">{formatVnd(ev.priceFrom)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Personalized "Có thể bạn thích" — dark section
// ─────────────────────────────────────────────────────────────
function ForYouSection() {
  const { isAuthenticated, user } = useAuthStore();
  const events = FOR_YOU_EVENTS.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-stone-900 py-12 text-white lg:py-16">
      <div className="absolute inset-0 bg-mesh-warm opacity-90" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
              <Sparkles className="h-3.5 w-3.5" /> Dành cho bạn
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">
              {isAuthenticated && user ? `${user.full_name.split(' ').pop()}, có thể bạn sẽ thích` : 'Cá nhân hóa cho bạn'}
            </h2>
            <p className="mt-1 text-sm text-stone-300 md:text-base">
              {isAuthenticated ? 'Gợi ý dựa trên các sự kiện bạn từng quan tâm' : 'Đăng nhập để nhận gợi ý phù hợp gu của bạn'}
            </p>
          </div>
          <Link href="/events?sort=for-you" className="hidden items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200 md:inline-flex">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {!isAuthenticated && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500/30">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <div className="font-semibold">Mở khóa đề xuất riêng cho bạn</div>
                <div className="text-sm text-stone-300">Đăng nhập để nhận gợi ý chính xác hơn từ TicketRush AI</div>
              </div>
            </div>
            <Link href="#" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-900 transition-all hover:-translate-y-0.5 hover:bg-amber-400">
              Đăng nhập <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="stagger-children grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// New events grid
// ─────────────────────────────────────────────────────────────
function NewEventsGrid() {
  return (
    <section className="bg-stone-50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Mới mở bán
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Vé mới lên sàn</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Đặt sớm để săn ưu đãi early-bird</p>
          </div>
          <Link href="/events?sort=new" className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="stagger-children grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {NEW_EVENTS.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// News section — articles about events & artists
// ─────────────────────────────────────────────────────────────
function NewsSection() {
  const [featured, ...rest] = NEWS_ARTICLES;
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700">
              <Newspaper className="h-3.5 w-3.5" /> Tin tức
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Điểm tin sự kiện &amp; nghệ sĩ</h2>
            <p className="mt-1 text-sm text-stone-500 md:text-base">Góc cập nhật mới nhất từ hậu trường các live show và nghệ sĩ yêu thích</p>
          </div>
          <Link href="#" className="hidden items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-600 sm:inline-flex">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Featured */}
          <Link href="#" className="group relative overflow-hidden rounded-2xl shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift lg:col-span-7">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured.cover} alt={featured.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="inline-flex rounded-full bg-sky-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {featured.category}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold leading-tight md:text-2xl">{featured.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/80">{featured.excerpt}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
                  <span>{featured.publishedAt}</span>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{featured.readMin} phút đọc</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Side list */}
          <div className="space-y-4 lg:col-span-5">
            {rest.slice(0, 4).map((a) => (
              <Link key={a.id} href="#" className="group flex gap-4 rounded-2xl p-2 transition-colors hover:bg-stone-50">
                <div className="aspect-[4/3] w-32 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.cover} alt={a.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">{a.category}</span>
                  <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug text-stone-900 group-hover:text-amber-700 md:text-base">
                    {a.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-stone-500">
                    <span>{a.publishedAt}</span>
                    <span className="h-1 w-1 rounded-full bg-stone-300" />
                    <span>{a.readMin} phút đọc</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-center sm:hidden">
          <Link href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
            Xem tất cả bài viết <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Trust signals
// ─────────────────────────────────────────────────────────────
function TrustSignals() {
  const iconMap: Record<string, React.ReactNode> = {
    'shield-check': <ShieldCheck className="h-6 w-6" />,
    'rotate-ccw':   <RotateCcw className="h-6 w-6" />,
    'headphones':   <Headphones className="h-6 w-6" />,
  };
  return (
    <section className="border-y border-stone-200 bg-white py-12">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 lg:px-8">
        {TRUST_SIGNALS.map((t) => (
          <div key={t.title} className="flex items-start gap-4 rounded-2xl p-2">
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700 ring-4 ring-amber-50">
              {iconMap[t.icon]}
            </div>
            <div>
              <div className="font-semibold text-stone-900">{t.title}</div>
              <div className="mt-0.5 text-sm text-stone-500">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white"><Ticket className="h-5 w-5" /></span>
              TicketRush
            </div>
            <p className="mt-3 text-sm text-stone-400">Nền tảng đặt vé sự kiện trực tuyến hàng đầu Việt Nam — nhanh, an toàn, minh bạch.</p>
            <div className="mt-4 flex items-center gap-2">
              {['fa-brands fa-facebook-f', 'fa-brands fa-instagram', 'fa-brands fa-youtube', 'fa-brands fa-x-twitter', 'fa-brands fa-tiktok'].map((c) => (
                <a key={c} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-stone-700 transition-all hover:-translate-y-0.5 hover:border-amber-500 hover:text-amber-400">
                  <i className={`${c} text-sm`} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.company.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Khám phá</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.discover.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-white">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              {FOOTER_LINKS.support.map((l) => (
                <li key={l.label}><Link href={l.href} className="hover:text-amber-400">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-stone-800 pt-6 text-xs text-stone-500 md:flex-row md:items-center">
          <div>© 2026 TicketRush · Đồ án môn INT3306 · UET, ĐHQGHN</div>
          <div className="flex items-center gap-3">
            <span className="text-stone-600">Thanh toán:</span>
            {['Visa', 'Mastercard', 'Momo', 'ZaloPay', 'VNPay'].map((p) => (
              <span key={p} className="rounded-md border border-stone-700 px-2 py-1 text-[10px] font-semibold text-stone-400">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      <Navbar />
      <Hero />
      <CategoriesGrid />
      <ThisWeekSection />
      <TrendingLeaderboard />
      <ForYouSection />
      <NewEventsGrid />
      <NewsSection />
      <TrustSignals />
      <Footer />
    </main>
  );
}
