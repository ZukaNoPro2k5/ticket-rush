'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { HERO_SLIDES, type HeroSlide } from '@/data/uiConfig';
import type { DisplayEvent } from '@/types';
import { EventPosterImage } from '@/components/common/EventPosterImage';
import { resolveEventPoster } from '@/lib/utils/eventImages';

const AUTOPLAY_MS = 7000;

const BADGE_LABELS: Record<string, string> = {
  hot: 'ĐANG HOT',
  new: 'MỚI MỞ BÁN',
  'almost-sold': 'SẮP CHÁY VÉ',
};

function eventsToSlides(events: DisplayEvent[]): HeroSlide[] {
  return events.slice(0, 6).map((e) => ({
    id: e.id,
    title: e.title,
    subtitle: `${e.dateLabel} · ${e.timeLabel}`,
    tagline: e.venue,
    badge: e.badge ? (BADGE_LABELS[e.badge] ?? 'NỔI BẬT') : 'NỔI BẬT',
    image: resolveEventPoster(e.poster, e.categoryKey),
    date: `${e.dateLabel} · ${e.timeLabel}`,
    venue: e.city,
  }));
}

export function HeroCarousel({ events, loading = false }: { events?: DisplayEvent[]; loading?: boolean }) {
  const slides: HeroSlide[] = loading
    ? HERO_SLIDES
    : events && events.length > 0
      ? eventsToSlides(events)
      : HERO_SLIDES;
  const [active, setActive] = useState(0);
  const slide = slides[active];

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [slides.length, loading]);

  const prev = () => setActive((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActive((i) => (i + 1) % slides.length);

  if (loading) {
    return (
      <section className="relative h-[78vh] min-h-[590px] max-h-[760px] w-full overflow-hidden bg-stone-900">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/10" />
        <div className="absolute inset-x-0 bottom-14 top-0 z-10 sm:bottom-[140px]">
          <div className="mx-auto flex h-full max-w-7xl items-end px-4 pb-8 pt-24 sm:pb-10 lg:px-8">
            <div className="w-full max-w-2xl space-y-4">
              <div className="h-5 w-28 rounded-full bg-stone-700" />
              <div className="h-12 w-3/4 rounded-xl bg-stone-700" />
              <div className="h-10 w-1/2 rounded-xl bg-stone-700" />
              <div className="h-4 w-40 rounded bg-stone-700" />
              <div className="h-10 w-28 rounded-full bg-stone-700" />
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-20 hidden h-[140px] bg-gradient-to-t from-stone-950/85 via-stone-950/45 to-transparent pb-4 pt-4 sm:block">
          <div className="mx-auto flex max-w-7xl gap-3 px-4 lg:px-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 w-36 flex-shrink-0 rounded-xl bg-stone-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[78vh] min-h-[590px] max-h-[760px] w-full overflow-hidden">
      {slides.map((s, i) => (
        <EventPosterImage
          key={`${s.id}-${i}`}
          src={s.image}
          category="other"
          alt={s.title}
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : 'low'}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-stone-950/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/55 to-transparent md:via-stone-950/10" />

      <div className="absolute inset-x-0 bottom-14 top-0 z-10 sm:bottom-[140px]">
        <div className="mx-auto flex h-full max-w-7xl items-end px-4 pb-8 pt-24 sm:pb-10 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl text-white"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-soft">
                <Flame className="h-3.5 w-3.5" /> {slide.badge}
              </span>
              <h1 className="mt-3 line-clamp-2 font-display text-3xl font-bold leading-tight sm:text-4xl md:mt-4 md:text-[2.65rem] lg:text-5xl">
                {slide.title}
              </h1>
              <p className="mt-2 text-base font-medium text-amber-200 sm:text-lg">{slide.subtitle}</p>
              <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/80 md:text-base">{slide.tagline}</p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/90">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-300" /> {slide.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-300" /> {slide.venue}
                </span>
              </div>

              <div className="mt-5">
                <Link
                  href={`/events/${slide.id}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-600 sm:px-6 sm:py-3 sm:text-base"
                >
                  Chi tiết <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={prev}
        aria-label="Slide trước"
        className="group absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 md:grid lg:left-6"
      >
        <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
      </button>
      <button
        onClick={next}
        aria-label="Slide sau"
        className="group absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 md:grid lg:right-6"
      >
        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-20 hidden h-[140px] bg-gradient-to-t from-stone-950/85 via-stone-950/45 to-transparent pb-4 pt-4 sm:block">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex gap-2 sm:gap-3">
            {slides.map((s, i) => (
              <button
                key={`${s.id}-${i}`}
                onClick={() => setActive(i)}
                aria-label={`Đến slide ${i + 1}: ${s.title}`}
                style={{ flex: '0 0 auto', width: `clamp(108px, calc((100% - ${(slides.length - 1) * 12}px) / ${slides.length}), 190px)` }}
                className={`group relative aspect-[16/9] overflow-hidden rounded-xl border text-left transition-all duration-300 ${
                  i === active
                    ? 'border-amber-400 shadow-soft'
                    : 'border-white/10 opacity-55 hover:border-white/45 hover:opacity-90'
                }`}
              >
                <EventPosterImage
                  src={s.image}
                  category="other"
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
                <div className="absolute inset-x-2 bottom-1.5">
                  <div className="line-clamp-1 text-[11px] font-semibold text-white">{s.title}</div>
                  <div className="mt-0.5 line-clamp-1 text-[10px] text-white/70">{s.date.split(' · ').slice(0, 2).join(' · ')}</div>
                </div>
                {i === active && <span className="absolute inset-x-0 top-0 h-0.5 bg-amber-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-1.5 sm:hidden">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Đến slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  );
}
