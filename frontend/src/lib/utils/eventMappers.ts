import type { Event, DisplayEvent } from '@/types';
import { EVENT_CATEGORY_LABELS } from './eventCategories';
import { resolveEventPoster } from './eventImages';

export const WEEK_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function deriveCityFromVenue(venue: string): string {
  const parts = venue.split(',');
  const last = parts[parts.length - 1].trim();
  const normalized = last.toLowerCase();

  if (/hà nội|ha noi/i.test(normalized)) return 'Hà Nội';
  if (/hồ chí minh|tp\.?\s*hcm|hcm|ho chi minh/i.test(normalized)) return 'TP. HCM';
  if (/đà nẵng|da nang/i.test(normalized)) return 'Đà Nẵng';
  if (/hải phòng|hai phong/i.test(normalized)) return 'Hải Phòng';
  if (/huế|hue/i.test(normalized)) return 'Huế';
  return last || 'Việt Nam';
}

export function toDisplayEvent(e: Event): DisplayEvent {
  const d = new Date(e.event_date);
  const pad = (n: number) => String(n).padStart(2, '0');

  const total = e.total_seats ?? 0;
  const available = e.available_seats ?? total;
  const soldPercent = total > 0 ? Math.round(((total - available) / total) * 100) : 0;

  let badge: DisplayEvent['badge'];
  if (soldPercent >= 90) badge = 'almost-sold';
  else if (soldPercent >= 70) badge = 'hot';
  else {
    const createdAt = new Date(e.created_at);
    const ageMs = Date.now() - createdAt.getTime();
    if (ageMs < 7 * 24 * 60 * 60 * 1000) badge = 'new';
  }

  return {
    id: e.id,
    title: e.title,
    category: EVENT_CATEGORY_LABELS[e.category] ?? 'Sự kiện',
    categoryKey: e.category,
    venue: e.venue,
    city: deriveCityFromVenue(e.venue),
    date: e.event_date,
    dateLabel: `${WEEK_DAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
    timeLabel: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    poster: resolveEventPoster(e.poster_url, e.category),
    priceFrom: e.min_price ?? 0,
    priceTo: e.max_price ?? e.min_price ?? 0,
    soldPercent,
    badge,
  };
}
