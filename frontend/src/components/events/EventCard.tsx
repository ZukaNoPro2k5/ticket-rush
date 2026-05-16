import type { DisplayEvent } from '@/types';
import Link from 'next/link';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { EventPosterImage } from '@/components/common/EventPosterImage';
import { EVENT_CATEGORY_OPTIONS } from './EventsCategoryBar';

const BADGE_MAP: Record<NonNullable<DisplayEvent['badge']>, { label: string; cls: string }> = {
  hot: { label: 'HOT', cls: 'bg-rose-500 text-white' },
  new: { label: 'MỚI', cls: 'bg-amber-500 text-white' },
  'almost-sold': { label: 'SẮP CHÁY VÉ', cls: 'bg-orange-600 text-white' },
  special: { label: 'ĐẶC BIỆT', cls: 'bg-purple-600 text-white' },
};

export function EventCard({ event }: { event: DisplayEvent }) {
  const badge = event.badge ? BADGE_MAP[event.badge] : null;
  const categoryIcon = EVENT_CATEGORY_OPTIONS.find((c) => c.key === event.categoryKey)?.icon ?? 'fa-solid fa-tag';

  return (
    <div className="flex h-full flex-col transition-transform duration-200 hover:-translate-y-1.5 active:scale-[0.98]">
      <Link
        href={`/events/${event.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-shadow duration-200 hover:shadow-lift"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <EventPosterImage
            src={event.poster}
            category={event.categoryKey}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-900/70 to-transparent" />

          {badge && (
            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lift ${badge.cls}`}>
              {badge.label}
            </span>
          )}

          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-700 backdrop-blur-md">
            <i className={`${categoryIcon} text-amber-600`} aria-hidden />
            {event.category}
          </span>

          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-xs text-white">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {event.dateLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {event.timeLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 min-h-[3rem] font-semibold leading-snug text-stone-900 transition-colors group-hover:text-amber-700">
            {event.title}
          </h3>
          <div className="mt-1.5 line-clamp-1 text-sm text-stone-500">
            <MapPin className="mr-1 inline h-3.5 w-3.5" /> {event.venue}
          </div>

          <div className="mt-auto pt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
              <span>Đã bán {event.soldPercent}%</span>
              {event.soldPercent >= 80 && <span className="font-semibold text-orange-600">Sắp cháy vé</span>}
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${event.soldPercent >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`}
                style={{ width: `${event.soldPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
