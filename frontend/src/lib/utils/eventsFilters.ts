import type { CategoryKey } from '@/data/uiConfig';

export type SortKey = 'trending' | 'newest' | 'upcoming' | 'priceAsc' | 'priceDesc';
export type ViewMode = 'grid' | 'list';
export type TimeRangeKey = 'all' | 'today' | 'weekend' | 'week' | 'month';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'trending', label: 'Phổ biến nhất' },
  { key: 'newest', label: 'Mới nhất' },
  { key: 'upcoming', label: 'Sắp diễn ra' },
  { key: 'priceAsc', label: 'Giá: Thấp đến cao' },
  { key: 'priceDesc', label: 'Giá: Cao đến thấp' },
];

export const CITIES = ['Tất cả', 'Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Huế'] as const;

export const TIME_RANGES: { key: TimeRangeKey; label: string }[] = [
  { key: 'all', label: 'Tất cả thời gian' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'weekend', label: 'Cuối tuần' },
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
];

export const DEFAULT_PRICE_MAX = 5_000_000;
export const PAGE_SIZE = 18;

export interface EventsFilterState {
  query: string;
  activeCat: CategoryKey | null;
  timeRange: TimeRangeKey;
  city: string;
  priceMax: number;
  sort: SortKey;
}
