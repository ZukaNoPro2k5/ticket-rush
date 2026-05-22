'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, ChevronLeft, ChevronRight, Flame, MapPin, ArrowRight,
} from 'lucide-react';
import type { DisplayEvent } from '@/types';
import { useLocale } from '@/components/providers/LocaleProvider';

const AUTOPLAY_MS = 7000;

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  image: string;
  date: string;
  venue: string;
}

function eventsToSlides(events: DisplayEvent[], copy: ReturnType<typeof useLocale>['messages']): HeroSlide[] {
  return events.slice(0, 6).map((e) => ({
    id: e.id,
    title: e.title,
    subtitle: `${e.dateLabel} · ${e.timeLabel}`,
    tagline: e.venue,
    badge: e.badge === 'almost-sold'
      ? copy.events.almostSold
      : e.badge === 'new'
        ? copy.events.new
        : e.badge === 'hot'
          ? 'HOT'
          : copy.home.highlighted,
    image: e.poster,
    date: `${e.dateLabel} · ${e.timeLabel}`,
    venue: e.city,
  }));
}

export function HeroCarousel({ events, loading = false }: { events?: DisplayEvent[]; loading?: boolean }) {
  const { messages } = useLocale();
  const slides: HeroSlide[] = events && events.length > 0 ? eventsToSlides(events, messages) : [];
  const [active, setActive] = useState(0);
  const slide = slides[active];

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  useEffect(() => {
    if (loading || slides.length === 0) return;
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [slides.length, loading]);

  const prev = () => setActive((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActive((i) => (i + 1) % slides.length);

  // Loading skeleton — shown while API hasn't responded yet
  if (loading) {
    return (
      <section className="relative h-[78vh] min-h-[560px] max-h-[760px] w-full overflow-hidden bg-stone-900">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/55 to-stone-900/15" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-14 pt-24 sm:pb-16 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <div className="h-5 w-28 rounded-full bg-stone-700" />
            <div className="h-14 w-3/4 rounded-xl bg-stone-700" />
            <div className="h-14 w-1/2 rounded-xl bg-stone-700" />
            <div className="h-4 w-40 rounded bg-stone-700" />
            <div className="h-11 w-32 rounded-full bg-stone-700" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full bg-stone-700 ${i === 0 ? 'w-8' : 'w-2'}`} />
          ))}
        </div>
      </section>
    );
  }

  if (!slide) {
    return (
      <section className="relative flex min-h-[560px] w-full items-end overflow-hidden bg-stone-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.2),transparent_34%),linear-gradient(135deg,#292524,#0c0a09)]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-28 text-white lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
            <Flame className="h-3.5 w-3.5" /> {messages.home.waitingForSale}
          </span>
          <h1 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight md:text-5xl">
            {messages.home.noPublished}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-stone-300 md:text-base">
            {messages.home.noPublishedDesc}
          </p>
          <Link
            href="/events"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            {messages.home.viewAllEvents} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[78vh] min-h-[560px] max-h-[760px] w-full overflow-hidden">
      {/* Image stack with crossfade */}
      {slides.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${s.id}-${i}`}
          src={s.image}
          alt={s.title}
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : 'low'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/55 to-stone-900/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/65 to-transparent md:via-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-14 pt-24 sm:pb-16 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-lift">
              <Flame className="h-3.5 w-3.5" /> {slide.badge}
            </span>
            <h1 className="mt-3 max-w-xl font-display text-2xl font-bold leading-tight sm:text-3xl md:mt-4 md:text-4xl lg:text-5xl">
              {slide.title}
            </h1>
            <p className="mt-2 text-base font-medium text-amber-200 sm:text-lg md:text-xl">{slide.subtitle}</p>
            <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/80 sm:mt-3 md:text-base">{slide.tagline}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-amber-300" /> {slide.date}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-amber-300" /> {slide.venue}</span>
            </div>

            <div className="mt-5">
              <Link
                href={`/events/${slide.id}`}
                className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-600 sm:px-6 sm:py-3 sm:text-base"
              >
                {messages.common.details} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Side arrows */}
      <button
        onClick={prev}
        aria-label={messages.home.slidePrevious}
        className="group absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:grid lg:left-6"
      >
        <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={next}
        aria-label={messages.home.slideNext}
        className="group absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/20 md:grid lg:right-6"
      >
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* Compact dots-only navigation */}
      <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`${messages.home.goToSlide} ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? 'w-8 bg-amber-400' : 'w-2 bg-white/45 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
