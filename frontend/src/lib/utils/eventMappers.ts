import type { Event, DisplayEvent } from '@/types';

export const CATEGORY_LABELS: Record<string, string> = {
  music: 'Âm nhạc',
  arts: 'Nghệ thuật',
  stage: 'Sân khấu',
  sports: 'Thể thao',
  food: 'Ẩm thực',
  entertainment: 'Giải trí',
  workshop: 'Hội thảo',
  other: 'Khác',
};

export const WEEK_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80';

export function deriveCityFromVenue(venue: string): string {
  const parts = venue.split(',');
  const last = parts[parts.length - 1].trim();
  if (/hà nội/i.test(last)) return 'Hà Nội';
  if (/hồ chí minh|tp\.?\s*hcm|hcm/i.test(last)) return 'TP. HCM';
  if (/đà nẵng/i.test(last)) return 'Đà Nẵng';
  if (/hải phòng/i.test(last)) return 'Hải Phòng';
  if (/huế/i.test(last)) return 'Huế';
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
    category: CATEGORY_LABELS[e.category] ?? 'Khác',
    categoryKey: e.category as DisplayEvent['categoryKey'],
    venue: e.venue,
    city: deriveCityFromVenue(e.venue),
    date: e.event_date,
    dateLabel: `${WEEK_DAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
    timeLabel: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    poster: e.poster_url ?? FALLBACK_POSTER,
    priceFrom: e.min_price ?? 0,
    priceTo: e.max_price ?? e.min_price ?? 0,
    soldPercent,
    badge,
  };
}
