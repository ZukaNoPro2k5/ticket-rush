import api from './client';
import type {
  AdminEvent,
  ApiResponse,
  Event,
  EventCategory,
  EventDetail,
  EventLayoutConfig,
  EventStatus,
  PaginatedResponse,
  SeatZone,
} from '@/types';

export interface ListEventsParams {
  category?: EventCategory;
  status?: EventStatus;
  search?: string;
  city?: 'ha-noi' | 'ho-chi-minh' | 'da-nang' | 'hai-phong' | 'hue' | 'other';
  time_range?: 'today' | 'weekend' | 'week' | 'month' | 'next_month' | 'other';
  max_price?: number;
  page?: number;
  limit?: number;
  sort?: 'event_date' | 'created_at' | 'sold' | 'price';
  order?: 'asc' | 'desc';
}

export interface EventFormPayload {
  title: string;
  description?: string;
  category: EventCategory;
  seating_mode?: import('@/types').SeatingMode;
  venue: string;
  event_date: string;
  poster_url?: string;
  layout_config?: EventLayoutConfig | null;
}

export async function listEvents(params: ListEventsParams = {}): Promise<{
  events: Event[];
  pagination: PaginatedResponse<Event>['pagination'];
}> {
  const res = await api.get<ApiResponse<{ events: Event[]; pagination: PaginatedResponse<Event>['pagination'] }>>(
    '/events',
    { params },
  );
  return res.data.data!;
}

export async function getEventById(id: number): Promise<EventDetail> {
  const res = await api.get<ApiResponse<EventDetail>>(`/events/${id}`);
  return res.data.data!;
}

export async function createEvent(payload: EventFormPayload): Promise<Event> {
  const res = await api.post<ApiResponse<Event>>('/events', payload);
  return res.data.data!;
}

export async function updateEvent(id: number, payload: Partial<EventFormPayload>): Promise<Event> {
  const res = await api.put<ApiResponse<Event>>(`/events/${id}`, payload);
  return res.data.data!;
}

export async function changeEventStatus(id: number, status: Exclude<EventStatus, 'draft'>): Promise<Event> {
  const res = await api.patch<ApiResponse<Event>>(`/events/${id}/status`, { status });
  return res.data.data!;
}

export async function checkInTicket(ticketId: number): Promise<unknown> {
  const res = await api.post<ApiResponse<unknown>>(`/tickets/${ticketId}/check-in`);
  return res.data.data;
}

export interface AdminEventsParams {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listAdminEvents(params: AdminEventsParams = {}): Promise<{
  events: AdminEvent[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
}> {
  const res = await api.get<ApiResponse<{
    events: AdminEvent[];
    pagination: { page: number; limit: number; total: number; total_pages: number };
  }>>('/admin/events', { params });
  return res.data.data!;
}

function isNotFound(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 404;
}

export async function listSeatZonesTolerant(eventId: number): Promise<{
  available: boolean;
  zones: SeatZone[];
  message?: string;
}> {
  try {
    const res = await api.get<ApiResponse<SeatZone[]>>(`/events/${eventId}/zones`);
    return { available: true, zones: res.data.data ?? [] };
  } catch (err) {
    if (!isNotFound(err)) {
      throw err;
    }
  }

  try {
    const res = await api.get<ApiResponse<SeatZone[]>>(`/events/${eventId}/seat-zones`);
    return { available: true, zones: res.data.data ?? [] };
  } catch (err) {
    if (!isNotFound(err)) {
      throw err;
    }
  }

  return {
    available: false,
    zones: [],
    message: 'Không tìm thấy dữ liệu khu ghế từ backend.',
  };
}
