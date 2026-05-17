// Static UI configuration — does NOT contain dynamic/API content.
// Event content, news, promotions come from the backend API.


export type CategoryKey =
  | 'music'
  | 'arts'
  | 'sports'
  | 'food'
  | 'entertainment'
  | 'workshop'
  | 'stage'
  | 'other';

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: string; // FA class
  accent: string; // tailwind bg+text
  ring: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'music',         label: 'Âm nhạc',    icon: 'fa-solid fa-music',           accent: 'bg-rose-100 text-rose-600',      ring: 'ring-rose-200' },
  { key: 'arts',          label: 'Nghệ thuật', icon: 'fa-solid fa-palette',         accent: 'bg-sky-100 text-sky-600',        ring: 'ring-sky-200' },
  { key: 'sports',        label: 'Thể thao',   icon: 'fa-solid fa-futbol',          accent: 'bg-emerald-100 text-emerald-600', ring: 'ring-emerald-200' },
  { key: 'food',          label: 'Ẩm thực',    icon: 'fa-solid fa-utensils',        accent: 'bg-teal-100 text-teal-600',      ring: 'ring-teal-200' },
  { key: 'entertainment', label: 'Giải trí',   icon: 'fa-solid fa-masks-theater',   accent: 'bg-purple-100 text-purple-600',  ring: 'ring-purple-200' },
  { key: 'workshop',      label: 'Hội thảo',   icon: 'fa-solid fa-chalkboard-user', accent: 'bg-amber-100 text-amber-600',    ring: 'ring-amber-200' },
  { key: 'stage',         label: 'Sân khấu',   icon: 'fa-solid fa-theater-masks',   accent: 'bg-orange-100 text-orange-600',  ring: 'ring-orange-200' },
  { key: 'other',         label: 'Khác',       icon: 'fa-solid fa-tag',             accent: 'bg-stone-100 text-stone-600',    ring: 'ring-stone-200' },
];

export const FOOTER_LINKS = {
  company: [
    { label: 'Về TicketRush',  href: '/about' },
    { label: 'Tin tức',        href: '/news' },
    { label: 'Liên hệ',        href: '/help' },
  ],
  discover: [
    { label: 'Tất cả sự kiện', href: '/events' },
    { label: 'Sự kiện hot',    href: '/events?sort=trending' },
    { label: 'Sắp diễn ra',    href: '/events?sort=upcoming' },
    { label: 'Vé giá rẻ',      href: '/events?sort=priceAsc' },
  ],
  support: [
    { label: 'Trung tâm trợ giúp', href: '/help' },
    { label: 'Hướng dẫn mua vé',   href: '/help#buying' },
    { label: 'Chính sách hoàn vé',  href: '/refund-policy' },
    { label: 'Điều khoản dịch vụ',  href: '/terms' },
  ],
};

export const TRUST_SIGNALS = [
  { icon: 'shield-check', title: 'Đặt vé an toàn',      desc: 'Giữ ghế rõ ràng · không bán trùng · QR sau xác nhận' },
  { icon: 'rotate-ccw',   title: 'Vòng đời minh bạch',  desc: 'Ghế tự nhả khi hết hạn, trạng thái cập nhật realtime' },
  { icon: 'headphones',   title: 'Hỗ trợ 24/7',         desc: 'Đội ngũ CSKH phản hồi trong 5 phút' },
];

export const TIME_TABS = [
  { key: 'today',   label: 'Hôm nay' },
  { key: 'weekend', label: 'Cuối tuần' },
  { key: 'week',    label: 'Tuần này' },
  { key: 'month',   label: 'Tháng này' },
] as const;
export type TimeTabKey = typeof TIME_TABS[number]['key'];

export function formatVnd(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ';
}
