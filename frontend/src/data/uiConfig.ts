// Static UI configuration — does NOT contain dynamic/API content.
// Event content, news, promotions come from the backend API.

import type { DisplayEvent } from '@/types';

export type CategoryKey =
  | 'music'
  | 'arts'
  | 'tech'
  | 'sports'
  | 'food'
  | 'entertainment'
  | 'workshop'
  | 'stage';

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: string; // FA class
  count: number;
  accent: string; // tailwind bg+text
  ring: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'music',         label: 'Âm nhạc',    icon: 'fa-solid fa-music',           count: 248, accent: 'bg-rose-100 text-rose-600',      ring: 'ring-rose-200' },
  { key: 'arts',          label: 'Nghệ thuật', icon: 'fa-solid fa-palette',         count: 132, accent: 'bg-sky-100 text-sky-600',        ring: 'ring-sky-200' },
  { key: 'tech',          label: 'Công nghệ',  icon: 'fa-solid fa-microchip',       count: 87,  accent: 'bg-pink-100 text-pink-600',      ring: 'ring-pink-200' },
  { key: 'sports',        label: 'Thể thao',   icon: 'fa-solid fa-futbol',          count: 96,  accent: 'bg-emerald-100 text-emerald-600', ring: 'ring-emerald-200' },
  { key: 'food',          label: 'Ẩm thực',    icon: 'fa-solid fa-utensils',        count: 64,  accent: 'bg-teal-100 text-teal-600',      ring: 'ring-teal-200' },
  { key: 'entertainment', label: 'Giải trí',   icon: 'fa-solid fa-masks-theater',   count: 154, accent: 'bg-purple-100 text-purple-600',  ring: 'ring-purple-200' },
  { key: 'workshop',      label: 'Hội thảo',   icon: 'fa-solid fa-chalkboard-user', count: 71,  accent: 'bg-amber-100 text-amber-600',    ring: 'ring-amber-200' },
  { key: 'stage',         label: 'Sân khấu',   icon: 'fa-solid fa-theater-masks',   count: 58,  accent: 'bg-orange-100 text-orange-600',  ring: 'ring-orange-200' },
];

export const FOOTER_LINKS = {
  company: [
    { label: 'Về TicketRush',  href: '#' },
    { label: 'Tuyển dụng',     href: '#' },
    { label: 'Tin tức',        href: '#' },
    { label: 'Liên hệ',        href: '#' },
  ],
  discover: [
    { label: 'Tất cả sự kiện', href: '/events' },
    { label: 'Sự kiện hot',    href: '/events?sort=trending' },
    { label: 'Sắp diễn ra',    href: '/events?sort=upcoming' },
    { label: 'Vé giá rẻ',      href: '/events?sort=price' },
  ],
  support: [
    { label: 'Trung tâm trợ giúp', href: '#' },
    { label: 'Hướng dẫn mua vé',   href: '#' },
    { label: 'Chính sách hoàn vé',  href: '#' },
    { label: 'Điều khoản dịch vụ',  href: '#' },
  ],
};

export const TRUST_SIGNALS = [
  { icon: 'shield-check', title: 'Thanh toán an toàn',  desc: 'Bảo mật chuẩn PCI DSS · 3D-Secure · không lưu thẻ' },
  { icon: 'rotate-ccw',   title: 'Hoàn vé minh bạch',   desc: 'Chính sách hoàn rõ ràng theo từng sự kiện' },
  { icon: 'headphones',   title: 'Hỗ trợ 24/7',         desc: 'Đội ngũ CSKH phản hồi trong 5 phút' },
];

export const STATS = [
  { value: '1,200+', label: 'Sự kiện đang mở bán' },
  { value: '98K+',   label: 'Vé đã giao thành công' },
  { value: '24',     label: 'Tỉnh thành phủ sóng' },
  { value: '4.9',    label: 'Điểm hài lòng (5.0)' },
];

export const TRENDING_CHIPS: string[] = [
  'EXO', 'Mr. Siro', 'Bùi Công Nam', 'GAI', 'Workshop',
  'Badass City', 'Mỹ Tâm', 'Stand-up Comedy', 'Art Fair',
  'V-League', 'Festival', 'IDECAF',
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

export type NewsArticle = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  cover: string;
  publishedAt: string;
  readMin: number;
  featured?: boolean;
};

export type NewsCategory =
  | 'Tất cả' | 'Showbiz' | 'Sự kiện' | 'Phỏng vấn'
  | 'Sân khấu' | 'Mẹo hay' | 'Review' | 'Hậu trường';

export const NEWS_CATEGORIES: NewsCategory[] = [
  'Tất cả', 'Showbiz', 'Sự kiện', 'Phỏng vấn',
  'Review', 'Hậu trường', 'Sân khấu', 'Mẹo hay',
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'n1',
    title: 'EXO PLANET #6 "EXhOrizon" — đêm diễn đầu tiên tại Việt Nam',
    excerpt: 'EXO chính thức trở lại Việt Nam sau nhiều năm vắng bóng. Đêm nhạc tại TP.HCM ngày 26/04 hứa hẹn bùng nổ với setlist đặc biệt và màn trình diễn live của các thành viên.',
    category: 'Showbiz',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80',
    publishedAt: '25/04/2026',
    readMin: 4,
    featured: true,
  },
  {
    id: 'n2',
    title: 'Bùi Công Nam "The Story" Livetour: từ Hà Nội đến Sài Gòn',
    excerpt: 'Sau đêm diễn ở Hà Nội (26/04), Bùi Công Nam tiếp tục hành trình đến TP.HCM vào 20/06. Đây là tour diễn quy mô nhất trong sự nghiệp của anh.',
    category: 'Showbiz',
    cover: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    publishedAt: '24/04/2026',
    readMin: 5,
  },
  {
    id: 'n3',
    title: 'BADASS CITY 2026 — Sài Gòn Hip-hop Festival hội tụ 30 rapper',
    excerpt: 'Lễ hội hip-hop lớn nhất miền Nam năm 2026 sẽ diễn ra ngày 02/05 với sự tham gia của Wowy, Suboi, MCK và hàng chục nghệ sĩ khác trên sân khấu ngoài trời.',
    category: 'Sự kiện',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
    publishedAt: '22/04/2026',
    readMin: 3,
  },
  {
    id: 'n4',
    title: 'IDECAF "Tấm Cám Đại Chiến" — kịch mục nóng nhất tháng 5',
    excerpt: 'Nhà hát kịch IDECAF tung phiên bản mới đầy táo bạo của câu chuyện cổ tích quen thuộc, kết hợp hài kịch hiện đại và vũ đạo đặc sắc. Vé mở bán 17/05.',
    category: 'Sân khấu',
    cover: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80',
    publishedAt: '20/04/2026',
    readMin: 5,
  },
  {
    id: 'n5',
    title: '5 mẹo săn vé early-bird không bị "cháy" trong mùa concert 2026',
    excerpt: 'Từ cài thông báo TicketBox, dùng ví điện tử pre-loaded, đến chiến thuật F5 lúc 0h — đây là những bí quyết được các "fan cứng" chia sẻ.',
    category: 'Mẹo hay',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
    publishedAt: '18/04/2026',
    readMin: 4,
  },
];

export const TRENDING_NEWS_IDS: string[] = ['n1', 'n3', 'n2'];

// ─────────────────────────────────────────────
// Hero Carousel — static slides (real events)
// ─────────────────────────────────────────────
export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  badge: string;
  image: string;
  date: string;
  venue: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'EXO PLANET #6 – EXhOrizon',
    subtitle: 'EXO WORLD TOUR 2026',
    tagline: 'Vòng lưu diễn thế giới — đêm duy nhất tại Đông Nam Á. Hơn 25 ca khúc spanning 12 năm sự nghiệp.',
    badge: 'HOT · 26/04 · TP.HCM',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80',
    date: '26/04/2026 · 19:00',
    venue: 'Sân vận động Phú Thọ, TP.HCM',
  },
  {
    id: 6,
    title: 'BADASS CITY 2026',
    subtitle: 'Saigon Hip-Hop Festival',
    tagline: 'Hơn 30 rapper hàng đầu: Wowy, Suboi, MCK, Tlinh, Đen Vâu & nhiều hơn nữa trên sân khấu ngoài trời.',
    badge: '30 NGHỆ SĨ · Festival',
    image: 'https://images.unsplash.com/photo-1571266028243-d220bc562f7c?w=1600&q=80',
    date: '02/05/2026 · 16:00',
    venue: 'Công viên bờ sông Sài Gòn, Bình Thạnh',
  },
  {
    id: 4,
    title: 'Bùi Công Nam "The Story" Livetour',
    subtitle: 'Hà Nội 2026',
    tagline: 'Chuyến lưu diễn đầu tiên trong sự nghiệp — hành trình kể chuyện qua âm nhạc mộc mạc, chân thành.',
    badge: 'LIVETOUR 2026',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1600&q=80',
    date: '26/04/2026 · 20:00',
    venue: 'Trung tâm Hội nghị Quốc gia, Hà Nội',
  },
  {
    id: 9,
    title: 'Tấm Cám Đại Chiến!',
    subtitle: 'Nhà hát Kịch IDECAF',
    tagline: 'Cổ tích quen thuộc, phiên bản hài kịch bùng nổ — đạo diễn NSND Thành Lộc dàn dựng.',
    badge: 'SÂN KHẤU HOT',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1600&q=80',
    date: '17/05/2026 · 19:30',
    venue: 'IDECAF, 28 Lê Lợi, Quận 1',
  },
  {
    id: 16,
    title: 'Vietnam AI Summit 2026',
    subtitle: 'Hội thảo AI lớn nhất Đông Nam Á',
    tagline: 'Generative AI & Future of Work — 60+ diễn giả từ Google, Meta, VinAI và các startup AI hàng đầu.',
    badge: 'TECH · Hội thảo',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80',
    date: '15/05/2026 · 08:30',
    venue: 'GEM Center, Quận 1, TP.HCM',
  },
  {
    id: 15,
    title: 'ĐTDV Mùa Xuân 2026 – Chung Kết',
    subtitle: 'Liên Minh Huyền Thoại Việt Nam',
    tagline: 'Trận chung kết esports lớn nhất năm — hàng nghìn khán giả trực tiếp tại Nhà thi đấu Tinh Võ.',
    badge: 'CHUNG KẾT · eSports',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80',
    date: '01/05/2026 · 14:00',
    venue: 'Nhà thi đấu Tinh Võ, Bình Thạnh, TP.HCM',
  },
];

// ─────────────────────────────────────────────
// This Week Events — for EventCalendar & demo fallback
// ─────────────────────────────────────────────
export const THIS_WEEK_EVENTS: DisplayEvent[] = [
  {
    id: 1,
    title: 'EXO PLANET #6 – EXhOrizon',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Sân vận động Phú Thọ',
    city: 'TP. HCM',
    date: '2026-04-26T19:00:00',
    dateLabel: 'CN, 26/04',
    timeLabel: '19:00',
    poster: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    priceFrom: 900_000,
    priceTo: 4_500_000,
    soldPercent: 94,
    badge: 'hot',
    velocity: 32,
    organizer: 'Dream Maker Entertainment',
  },
  {
    id: 6,
    title: 'BADASS CITY 2026 – Saigon Hiphop Festival',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Công viên bờ sông Sài Gòn',
    city: 'TP. HCM',
    date: '2026-05-02T16:00:00',
    dateLabel: 'T7, 02/05',
    timeLabel: '16:00',
    poster: 'https://images.unsplash.com/photo-1571266028243-d220bc562f7c?w=800&q=80',
    priceFrom: 250_000,
    priceTo: 1_200_000,
    soldPercent: 78,
    badge: 'hot',
    velocity: 28,
    organizer: 'Badass Entertainment',
  },
  {
    id: 4,
    title: 'Bùi Công Nam "The Story" Livetour – Hà Nội',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Trung tâm Hội nghị Quốc gia',
    city: 'Hà Nội',
    date: '2026-04-26T20:00:00',
    dateLabel: 'CN, 26/04',
    timeLabel: '20:00',
    poster: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
    priceFrom: 900_000,
    priceTo: 3_000_000,
    soldPercent: 71,
    badge: 'hot',
    velocity: 22,
    organizer: 'Bùi Công Nam Team',
  },
  {
    id: 9,
    title: 'Nhà hát Kịch IDECAF: Tấm Cám Đại Chiến!',
    category: 'Sân khấu',
    categoryKey: 'stage',
    venue: 'Nhà hát Kịch IDECAF',
    city: 'TP. HCM',
    date: '2026-05-17T19:30:00',
    dateLabel: 'CN, 17/05',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    priceFrom: 250_000,
    priceTo: 600_000,
    soldPercent: 65,
    badge: 'new',
    velocity: 18,
    organizer: 'IDECAF',
  },
  {
    id: 10,
    title: 'Sân Khấu Hồng Vân: Già Gân',
    category: 'Sân khấu',
    categoryKey: 'stage',
    venue: 'Sân khấu Kịch Hồng Vân',
    city: 'TP. HCM',
    date: '2026-04-25T19:30:00',
    dateLabel: 'T7, 25/04',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=800&q=80',
    priceFrom: 200_000,
    priceTo: 500_000,
    soldPercent: 58,
    badge: 'new',
    velocity: 10,
    organizer: 'Sân khấu Kịch Hồng Vân',
  },
  {
    id: 11,
    title: 'Thanh Gươm và Bà Mẹ – Nhà hát Kịch Việt Nam',
    category: 'Sân khấu',
    categoryKey: 'stage',
    venue: 'Nhà hát Kịch Việt Nam',
    city: 'Hà Nội',
    date: '2026-04-26T19:30:00',
    dateLabel: 'CN, 26/04',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80',
    priceFrom: 150_000,
    priceTo: 400_000,
    soldPercent: 45,
    badge: 'new',
    velocity: 8,
    organizer: 'Nhà hát Kịch Việt Nam',
  },
  {
    id: 17,
    title: '[FLOWER 1969] Workshop Làm Nước Hoa',
    category: 'Hội thảo',
    categoryKey: 'workshop',
    venue: 'FLOWER 1969 Studio',
    city: 'Hà Nội',
    date: '2026-04-27T10:00:00',
    dateLabel: 'T2, 27/04',
    timeLabel: '10:00',
    poster: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    priceFrom: 350_000,
    priceTo: 600_000,
    soldPercent: 40,
    badge: 'new',
    velocity: 6,
    organizer: 'FLOWER 1969',
  },
  {
    id: 2,
    title: 'Mr. Siro Fan Concert – Encore',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Nhà thi đấu Quân khu 7',
    city: 'TP. HCM',
    date: '2026-04-30T19:30:00',
    dateLabel: 'T5, 30/04',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    priceFrom: 800_000,
    priceTo: 2_200_000,
    soldPercent: 48,
    badge: 'new',
    velocity: 10,
    organizer: 'Quản lý Mr. Siro',
  },
  {
    id: 3,
    title: 'GAI Home Concert – Hà Nội',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'Cung Văn hóa Hữu nghị Hà Nội',
    city: 'Hà Nội',
    date: '2026-04-30T20:00:00',
    dateLabel: 'T5, 30/04',
    timeLabel: '20:00',
    poster: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    priceFrom: 1_000_000,
    priceTo: 2_000_000,
    soldPercent: 45,
    badge: 'new',
    velocity: 9,
    organizer: 'GAI / Yến Lê Team',
  },
  {
    id: 18,
    title: '[Metashow] Triển Lãm Nghệ Thuật Ánh Sáng',
    category: 'Hội thảo',
    categoryKey: 'workshop',
    venue: 'Vincom Mega Mall Royal City',
    city: 'Hà Nội',
    date: '2026-04-24T09:00:00',
    dateLabel: 'T6, 24/04',
    timeLabel: '09:00',
    poster: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
    priceFrom: 150_000,
    priceTo: 350_000,
    soldPercent: 38,
    badge: undefined,
    velocity: 5,
    organizer: 'Metashow Vietnam',
  },
];

// ─────────────────────────────────────────────
// Trending Leaderboard — top 10 by ticket velocity
// ─────────────────────────────────────────────
export const TRENDING_LEADERBOARD: DisplayEvent[] = [
  { ...THIS_WEEK_EVENTS[0], rankChange: 2 },  // EXO — #1, up 2
  { ...THIS_WEEK_EVENTS[1], rankChange: 1 },  // BADASS CITY — #2, up 1
  { ...THIS_WEEK_EVENTS[2], rankChange: 0 },  // BCN HN — #3, same
  { ...THIS_WEEK_EVENTS[3], rankChange: 3 },  // IDECAF — #4, up 3
  {
    id: 16,
    title: 'Vietnam AI Summit 2026',
    category: 'Hội thảo',
    categoryKey: 'workshop',
    venue: 'GEM Center',
    city: 'TP. HCM',
    date: '2026-05-15T08:30:00',
    dateLabel: 'T6, 15/05',
    timeLabel: '08:30',
    poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    priceFrom: 2_500_000,
    priceTo: 5_000_000,
    soldPercent: 58,
    badge: 'special',
    rankChange: -1,
    velocity: 14,
    organizer: 'Vietnam AI Alliance',
  },
  {
    id: 15,
    title: 'ĐTDV Mùa Xuân 2026 – Chung Kết',
    category: 'Thể thao',
    categoryKey: 'sports',
    venue: 'Nhà thi đấu Tinh Võ',
    city: 'TP. HCM',
    date: '2026-05-01T14:00:00',
    dateLabel: 'T6, 01/05',
    timeLabel: '14:00',
    poster: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    priceFrom: 100_000,
    priceTo: 500_000,
    soldPercent: 52,
    badge: 'hot',
    rankChange: 2,
    velocity: 12,
    organizer: 'VEC Esports',
  },
  { ...THIS_WEEK_EVENTS[7], rankChange: 0 },  // Mr. Siro — #7
  { ...THIS_WEEK_EVENTS[8], rankChange: 1 },  // GAI — #8
  {
    id: 14,
    title: 'V-League 2026 – Hà Nội FC vs. HAGL',
    category: 'Thể thao',
    categoryKey: 'sports',
    venue: 'Sân vận động Hàng Đẫy',
    city: 'Hà Nội',
    date: '2026-05-03T19:15:00',
    dateLabel: 'CN, 03/05',
    timeLabel: '19:15',
    poster: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
    priceFrom: 100_000,
    priceTo: 400_000,
    soldPercent: 42,
    badge: undefined,
    rankChange: -1,
    velocity: 8,
    organizer: 'VPF',
  },
  {
    id: 5,
    title: 'Bùi Công Nam "The Story" Livetour – TP.HCM',
    category: 'Âm nhạc',
    categoryKey: 'music',
    venue: 'SECC',
    city: 'TP. HCM',
    date: '2026-06-20T19:30:00',
    dateLabel: 'T7, 20/06',
    timeLabel: '19:30',
    poster: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80',
    priceFrom: 900_000,
    priceTo: 3_000_000,
    soldPercent: 35,
    badge: undefined,
    rankChange: 0,
    velocity: 7,
    organizer: 'Bùi Công Nam Team',
  },
];
