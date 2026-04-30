import type { DisplayEvent } from '@/types';
import Link from 'next/link';
import { Calendar, ChevronRight, Clock, Flame, MapPin } from 'lucide-react';
import { EVENT_CATEGORY_OPTIONS } from '@/components/events/EventsCategoryBar';

interface Props {
  event: DisplayEvent;
}

export function EventHero({ event }: Props) {
  const categoryDef = EVENT_CATEGORY_OPTIONS.find((c) => c.key === event.categoryKey);

  return (
    <section className="relative h-[360px] w-full overflow-hidden md:h-[480px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={event.poster} alt={event.title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-stone-900/20" />

      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 lg:px-8">
        <nav className="mb-3 flex items-center gap-1.5 text-xs text-white/70">
          <Link href="/" className="hover:text-white">
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/events" className="hover:text-white">
            Sự kiện
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">{event.category}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {event.badge === 'hot' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lift">
              <Flame className="h-3.5 w-3.5" /> HOT
            </span>
          )}
          {event.badge === 'almost-sold' && (
            <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lift">
              Sắp cháy vé
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <i className={`${categoryDef?.icon ?? 'fa-solid fa-tag'} text-amber-300`} aria-hidden /> {event.category}
          </span>
        </div>

        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold text-white md:text-5xl">{event.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-amber-300" /> {event.dateLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-300" /> {event.timeLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-amber-300" /> {event.venue}, {event.city}
          </span>
        </div>
      </div>
    </section>
  );
}
