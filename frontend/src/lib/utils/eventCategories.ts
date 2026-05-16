import type { EventCategory } from '@/types';

export const EVENT_CATEGORY_KEYS = [
  'music',
  'stage',
  'sports',
  'workshop',
  'other',
  'arts',
  'tech',
  'food',
  'entertainment',
] as const satisfies readonly EventCategory[];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'Âm nhạc',
  stage: 'Sân khấu',
  sports: 'Thể thao',
  workshop: 'Workshop',
  other: 'Khác',
  arts: 'Nghệ thuật',
  tech: 'Công nghệ',
  food: 'Ẩm thực',
  entertainment: 'Giải trí',
};

export const EVENT_CATEGORY_ICONS: Record<EventCategory, string> = {
  music: 'fa-solid fa-music',
  stage: 'fa-solid fa-theater-masks',
  sports: 'fa-solid fa-futbol',
  workshop: 'fa-solid fa-chalkboard-user',
  other: 'fa-solid fa-tag',
  arts: 'fa-solid fa-palette',
  tech: 'fa-solid fa-microchip',
  food: 'fa-solid fa-utensils',
  entertainment: 'fa-solid fa-masks-theater',
};

export const EVENT_CATEGORY_OPTIONS = EVENT_CATEGORY_KEYS.map((key) => ({
  key,
  label: EVENT_CATEGORY_LABELS[key],
  icon: EVENT_CATEGORY_ICONS[key],
}));
