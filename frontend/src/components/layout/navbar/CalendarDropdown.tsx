'use client';

import { useEffect, useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { EventCalendar } from '../EventCalendar';
import type { DisplayEvent } from '@/types';
import { listEvents } from '@/lib/api/events';
import { toDisplayEvent } from '@/lib/utils/eventMappers';
import { useLocale } from '@/components/providers/LocaleProvider';

interface Props {
  linkCls: string;
  scrolled: boolean;
}

export function CalendarDropdown({ linkCls, scrolled }: Props) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const { messages } = useLocale();

  // Pre-fetch on mount so data is ready when the user opens the dropdown
  useEffect(() => {
    listEvents({ limit: 100, sort: 'event_date', order: 'asc' })
      .then((r) => setEvents(r.events.map(toDisplayEvent)))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          open ? (scrolled ? 'bg-amber-50 text-amber-700' : 'bg-white/10 text-white') : linkCls
        }`}
      >
        <Calendar className="h-4 w-4" /> {messages.nav.eventCalendar} <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-stone-950/10 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
          <EventCalendar events={events} onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
