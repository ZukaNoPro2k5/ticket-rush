import api from './client';
import type { ApiResponse, Event } from '@/types';

export async function listSavedEvents() {
  const res = await api.get<ApiResponse<Event[]>>('/engagement/events/favorites');
  return res.data.data ?? [];
}

export async function getEventFavorite(eventId: number) {
  const res = await api.get<ApiResponse<{ saved: boolean }>>(`/engagement/events/${eventId}/favorite`);
  return res.data.data!;
}

export async function saveEventFavorite(eventId: number) {
  const res = await api.post<ApiResponse<{ saved: boolean }>>(`/engagement/events/${eventId}/favorite`);
  return res.data.data!;
}

export async function removeEventFavorite(eventId: number) {
  const res = await api.delete<ApiResponse<{ saved: boolean }>>(`/engagement/events/${eventId}/favorite`);
  return res.data.data!;
}

export async function getPostBookmark(postId: number) {
  const res = await api.get<ApiResponse<{ saved: boolean }>>(`/engagement/posts/${postId}/bookmark`);
  return res.data.data!;
}

export async function savePostBookmark(postId: number) {
  const res = await api.post<ApiResponse<{ saved: boolean }>>(`/engagement/posts/${postId}/bookmark`);
  return res.data.data!;
}

export async function removePostBookmark(postId: number) {
  const res = await api.delete<ApiResponse<{ saved: boolean }>>(`/engagement/posts/${postId}/bookmark`);
  return res.data.data!;
}

export async function subscribeNewsletter(email: string) {
  const res = await api.post<ApiResponse<{ subscribed: boolean }>>('/engagement/newsletter/subscriptions', { email });
  return res.data.data!;
}
