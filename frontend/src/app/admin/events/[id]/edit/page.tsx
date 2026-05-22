'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { EventWizard } from '@/components/admin/EventWizard';
import { getEventById } from '@/lib/api/events';
import type { EventDetail } from '@/types';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const [event, setEvent]   = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    if (!eventId) { setError(true); setLoading(false); return; }
    getEventById(eventId)
      .then(setEvent)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Đang tải dữ liệu sự kiện…</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm font-semibold text-stone-600">Không tìm thấy sự kiện.</p>
      </div>
    );
  }

  const initialForm = {
    title:       event.title,
    description: event.description ?? '',
    category:    event.category,
    seating_mode: event.seating_mode,
    venue:       event.venue,
    event_date:  (() => {
      const d = new Date(event.event_date);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
    })(),
    poster_url: event.poster_url ?? '',
    layout_config: event.layout_config ?? undefined,
  };

  return (
    <EventWizard
      eventId={eventId}
      initialForm={initialForm}
      initialZones={event.seat_zones ?? []}
    />
  );
}
