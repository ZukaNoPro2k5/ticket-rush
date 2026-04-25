'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar, ChevronDown, ChevronLeft, ChevronRight, Flame, MapPin, ArrowRight,
} from 'lucide-react';
import { HERO_SLIDES, type HeroSlide } from '@/data/uiConfig';
import type { DisplayEvent } from '@/types';

const AUTOPLAY_MS = 7000;

const BADGE_LABELS: Record<string, string> = {
  'hot': 'ĐANG HOT',
  'new': 'MỚI MỞ BÁN',
  'almost-sold': 'SẮP CHÁY VÉ',
};

function eventsToSlides(events: DisplayEvent[]): HeroSlide[] {
  return events.slice(0, 6).map((e, i) => ({
    id: e.id,
    title: e.title,
    subtitle: `${e.dateLabel} · ${e.timeLabel}`,
    tagline: e.venue,
    badge: e.badge ? (BADGE_LABELS[e.badge] ?? 'NỔI BẬT') : 'NỔI BẬT',
    image: e.poster,
    date: `${e.dateLabel} · ${e.timeLabel}`,
    venue: e.city,
  }));
}

export function HeroCarousel({ events }: { events?: DisplayEvent[] }) {
  const slides: HeroSlide[] = (events && events.length > 0) ? eventsToSlides(events) : HERO_SLIDES;
  const [active, setActive] = useState(0);
  const slide = slides[active];

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  const prev = () => setActive((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActive((i) => (i + 1) % slides.length);

  const scrollToCategories = () => {
    const el = document.getElementById('home-categories');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
      {/* Image stack with crossfade */}
      {slides.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.id}
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
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-44 pt-24 sm:pb-52 lg:px-8">
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
              <Link
                href={`/events/${slide.id}`}
                className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-600 sm:px-6 sm:py-3 sm:text-base"
              >
                Chi tiết <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Side arrows */}
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

      {/* Bottom overlay: thumbnails + scroll cue */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-stone-950/85 via-stone-950/55 to-transparent pb-3 pt-10 sm:pb-4">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Desktop thumbnails */}
          <div className={`hidden gap-2 sm:grid sm:gap-3`} style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}>
            {slides.map((s, i) => (
              <button
                key={`${s.id}-${i}`}
                onClick={() => setActive(i)}
                aria-label={`Đến slide ${i + 1}: ${s.title}`}
                className={`group relative aspect-[16/10] overflow-hidden rounded-xl border-2 text-left transition-all duration-300 ${
                  i === active
                    ? 'border-amber-400 shadow-lift'
                    : 'border-white/15 opacity-70 hover:border-white/50 hover:opacity-100'
                }`}
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
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Đến slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>

          {/* Scroll cue */}
          <div className="mt-3 flex justify-center sm:mt-4">
            <button
              onClick={scrollToCategories}
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
