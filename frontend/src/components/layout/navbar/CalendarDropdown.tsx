'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { EventCalendar } from '../EventCalendar';

interface Props {
  linkCls: string;
}

export function CalendarDropdown({ linkCls }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${linkCls}`}
      >
        <Calendar className="h-4 w-4" /> Lịch sự kiện <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <EventCalendar onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
