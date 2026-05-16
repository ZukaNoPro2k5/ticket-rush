import type { DisplayEvent } from '@/types';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { EventPosterImage } from '@/components/common/EventPosterImage';

function formatVnd(value: number): string {
  return `${value.toLocaleString('vi-VN')}đ`;
}

interface Props {
  events: DisplayEvent[];
}

export function SimilarEvents({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <section className="border-t border-stone-200 bg-stone-100/50 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">Sự kiện tương tự</h2>
            <p className="mt-1 text-sm text-stone-500">Các sự kiện cùng mạch quan tâm</p>
          </div>
          <Link href="/events" className="text-sm font-semibold text-amber-700 hover:text-amber-800">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((ev) => (
            <Link
              key={ev.id}
              href={`/events/${ev.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <EventPosterImage
                  src={ev.poster}
                  category={ev.categoryKey}
                  alt={ev.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  {ev.category}
                </span>
                <h3 className="mt-1 line-clamp-2 font-semibold text-stone-900 group-hover:text-amber-700">
                  {ev.title}
                </h3>
                <div className="mt-1 text-xs text-stone-500">
                  <Calendar className="mr-0.5 inline h-3 w-3" /> {ev.dateLabel} · {ev.timeLabel}
                </div>
                <div className="mt-auto pt-3 font-display text-sm font-bold text-amber-700">
                  Từ {formatVnd(ev.priceFrom)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
