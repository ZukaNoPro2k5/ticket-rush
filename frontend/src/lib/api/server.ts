import type { Event, EventDetail, ApiResponse, PaginatedResponse } from '@/types';

// Server-only fetchers for public endpoints. Use this from React Server Components
// instead of the axios client (which depends on browser localStorage for auth).
//
// Cache strategy: tag-based revalidation. Backend mutations should call
// `revalidateTag('events')` via a route handler when published events change,
// otherwise data stays cached for `revalidate` seconds.

const API_URL =
  process.env.BACKEND_INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000/api';

interface ListEventsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'event_date' | 'created_at';
  order?: 'asc' | 'desc';
}

export async function fetchEventsServer(params: ListEventsParams = {}): Promise<{
  events: Event[];
  pagination: PaginatedResponse<Event>['pagination'];
}> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const url = `${API_URL}/events${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    next: { revalidate: 30, tags: ['events'] },
  });
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  const json = (await res.json()) as ApiResponse<{
    events: Event[];
    pagination: PaginatedResponse<Event>['pagination'];
  }>;
  return json.data!;
}

export async function fetchEventByIdServer(id: number): Promise<EventDetail | null> {
  const res = await fetch(`${API_URL}/events/${id}`, {
    next: { revalidate: 60, tags: ['events', `event:${id}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch event ${id}: ${res.status}`);
  const json = (await res.json()) as ApiResponse<EventDetail>;
  return json.data ?? null;
}
