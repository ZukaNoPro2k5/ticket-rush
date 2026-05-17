import api from './client';
import type { ApiResponse, EventCategory, User } from '@/types';

type UserProfile = User & {
  category_preferences?: EventCategory[] | string | null;
  preferred_city?: string | null;
};

const VALID_EVENT_CATEGORIES = new Set<EventCategory>([
  'music',
  'arts',
  'sports',
  'food',
  'entertainment',
  'workshop',
  'stage',
  'other',
]);

function normalizePreferences(value: UserProfile['category_preferences']): EventCategory[] {
  if (Array.isArray(value)) return value.filter((item): item is EventCategory => VALID_EVENT_CATEGORIES.has(item));
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is EventCategory =>
        typeof item === 'string' && VALID_EVENT_CATEGORIES.has(item as EventCategory))
      : [];
  } catch {
    return [];
  }
}

export async function getMyProfile() {
  const res = await api.get<ApiResponse<UserProfile>>('/users/me');
  const profile = res.data.data!;
  return {
    ...profile,
    category_preferences: normalizePreferences(profile.category_preferences),
  } as User;
}

export async function updateMyAvatar(dataUrl: string) {
  const res = await api.put<ApiResponse<User>>('/users/me/avatar', { data_url: dataUrl });
  return res.data.data!;
}
