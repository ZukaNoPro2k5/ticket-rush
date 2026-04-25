'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Clock, ArrowRight } from 'lucide-react';
import type { DisplayEvent } from '@/types';
import { EASE_OUT_EXPO } from '@/lib/motion';
import { listEvents } from '@/lib/api/events';
import { toDisplayEvent } from '@/lib/utils/eventMappers';

export function EventCalendar({ onClose }: { onClose: () => void }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selected, setSelected] = useState<number | null>(null);
  const [allEvents, setAllEvents] = useState<DisplayEvent[]>([]);

  // Fetch once — get enough events to populate the calendar
  useEffect(() => {
    listEvents({ limit: 100, sort: 'event_date', order: 'asc' })
      .then((r) => setAllEvents(r.events.map(toDisplayEvent)))
      .catch(() => {});
  }, []);

  const eventsByDay = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const map: Record<number, { hot: boolean; events: DisplayEvent[] }> = {};
    allEvents.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = { hot: false, events: [] };
        map[day].events.push(e);
        if (e.badge === 'hot' || e.badge === 'almost-sold') map[day].hot = true;
      }
    });
    return map;
  }, [allEvents, viewDate]);

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
    <motion.div
      initial={{ opacity: 0, y: -10, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
      className="absolute left-1/2 top-full z-50 mt-3 w-[440px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lift"
    >
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
                <span className="leading-none">{d}</span>
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

      <AnimatePresence>
        {selected != null && (
          <motion.div
            key="day-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="overflow-hidden border-t border-stone-200 bg-stone-50/60"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
