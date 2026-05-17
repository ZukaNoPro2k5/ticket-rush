import type { Post } from '@/types';

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

export function formatPostDate(value: string | null) {
  if (!value) return 'Chưa đăng';
  return new Intl.DateTimeFormat('vi-VN', {
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
