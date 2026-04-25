import type { DisplayEvent } from '@/types';
import Link from 'next/link';
import { Calendar, Clock, Flame, MapPin } from 'lucide-react';
import { formatVnd} from '@/data/uiConfig';

export function EventCardCompact({ event }: { event: DisplayEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.poster}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-stone-900/70 to-transparent" />

        {event.badge === 'hot' && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lift">
            <Flame className="h-3 w-3" /> HOT
          </span>
        )}
        {event.badge === 'almost-sold' && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lift">
            Sắp cháy vé
          </span>
        )}
        {event.badge === 'new' && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lift">
            MỚI
          </span>
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

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400">Từ</div>
            <div className="font-display text-base font-bold text-amber-700">{formatVnd(event.priceFrom)}</div>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors group-hover:bg-amber-500 group-hover:text-white">
            Xem vé
          </span>
        </div>
      </div>
    </Link>
  );
}
