import type { DisplayEvent } from '@/types';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { formatVnd} from '@/data/uiConfig';

export function EventCardList({ event }: { event: DisplayEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] w-40 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:w-56">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.poster}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col py-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">{event.category}</span>
        <h3 className="mt-0.5 line-clamp-2 font-display text-lg font-bold text-stone-900 group-hover:text-amber-700">
          {event.title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {event.dateLabel} · {event.timeLabel}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.venue}, {event.city}</span>
        </div>

        <div className="mt-2 max-w-xs">
          {event.soldPercent > 0 ? (
            <>
              <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500">
                <span>Đã bán {event.soldPercent}%</span>
                {event.soldPercent >= 80 && <span className="font-semibold text-orange-600">Sắp cháy vé</span>}
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-stone-100">
                <div
                  className={`h-full rounded-full ${event.soldPercent >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`}
                  style={{ width: `${event.soldPercent}%` }}
                />
              </div>
            </>
          ) : (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              Đang mở bán
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
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
