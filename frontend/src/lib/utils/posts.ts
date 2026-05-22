import type { Post } from '@/types';
import { localeTag, type Locale } from '@/lib/i18n';

export const POST_CATEGORIES = [
  'Tất cả',
  'Showbiz',
  'Sự kiện',
  'Phỏng vấn',
  'Bình luận',
  'Hậu trường',
  'Sân khấu',
  'Mẹo hay',
] as const;

const EN_CATEGORY_LABELS: Record<string, string> = {
  'Tất cả': 'All',
  'Sự kiện': 'Events',
  'Phỏng vấn': 'Interviews',
  'Bình luận': 'Commentary',
  'Hậu trường': 'Backstage',
  'Sân khấu': 'Stage',
  'Mẹo hay': 'Tips',
};

export function postCategoryLabel(locale: Locale, value: string) {
  return locale === 'en' ? (EN_CATEGORY_LABELS[value] ?? value) : value;
}

export function formatPostDate(value: string | null, locale: Locale = 'vi', unpublished = 'Chưa đăng') {
  if (!value) return unpublished;
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function authorInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function postStatusLabel(status: Post['status']) {
  return status === 'published' ? 'Đã đăng' : 'Bản nháp';
}
