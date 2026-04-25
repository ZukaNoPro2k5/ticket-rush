import api from './client';
import type { Event, EventDetail, ApiResponse, PaginatedResponse } from '@/types';

export interface ListEventsParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: 'event_date' | 'created_at';
  order?: 'asc' | 'desc';
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
