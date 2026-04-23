// Centralized mock data for the public marketing pages.
// Replace with real API calls when backend endpoints are ready.

export interface MockEvent {
  id: number;
  title: string;
  category: string; // display label e.g. "Âm nhạc"
  categoryKey: CategoryKey;
  venue: string;
  city: string;
  date: string; // ISO
  dateLabel: string; // e.g. "T7, 28/06"
  timeLabel: string; // e.g. "20:00"
  poster: string;
  priceFrom: number;
  priceTo: number;
  soldPercent: number;
  badge?: 'hot' | 'new' | 'almost-sold' | 'special';
  rankChange?: number; // +/- delta
  velocity?: number; // % sold in last 24h
  organizer?: string;
}

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
  icon: string; // FA class e.g. "fa-solid fa-music"
  count: number;
  accent: string; // tailwind bg color class for icon bg
  ring: string; // ring color
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'music',         label: 'Âm nhạc',     icon: 'fa-solid fa-music',          count: 248, accent: 'bg-rose-100 text-rose-600',     ring: 'ring-rose-200' },
  { key: 'arts',          label: 'Nghệ thuật',  icon: 'fa-solid fa-palette',        count: 132, accent: 'bg-sky-100 text-sky-600',       ring: 'ring-sky-200' },
  { key: 'tech',          label: 'Công nghệ',   icon: 'fa-solid fa-microchip',      count: 87,  accent: 'bg-pink-100 text-pink-600',     ring: 'ring-pink-200' },
  { key: 'sports',        label: 'Thể thao',    icon: 'fa-solid fa-futbol',         count: 96,  accent: 'bg-emerald-100 text-emerald-600', ring: 'ring-emerald-200' },
  { key: 'food',          label: 'Ẩm thực',     icon: 'fa-solid fa-utensils',       count: 64,  accent: 'bg-teal-100 text-teal-600',     ring: 'ring-teal-200' },
  { key: 'entertainment', label: 'Giải trí',    icon: 'fa-solid fa-masks-theater',  count: 154, accent: 'bg-purple-100 text-purple-600', ring: 'ring-purple-200' },
  { key: 'workshop',      label: 'Hội thảo',    icon: 'fa-solid fa-chalkboard-user', count: 71, accent: 'bg-amber-100 text-amber-600',  ring: 'ring-amber-200' },
  { key: 'stage',         label: 'Sân khấu',    icon: 'fa-solid fa-theater-masks',  count: 58,  accent: 'bg-orange-100 text-orange-600', ring: 'ring-orange-200' },
];

const IMG = {
  // Use Unsplash CDN with predictable params for fast preview
  concert1: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80',
  concert2: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80',
  concert3: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80',
  jazz:     'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&q=80',
  edm:      'https://images.unsplash.com/photo-1571266028243-d220bc562f7c?w=1200&q=80',
  art:      'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80',
  tech:     'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  sport:    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80',
  food:     'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
  comedy:   'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=1200&q=80',
  workshop: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
  stage:    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80',
};

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  date: string;
  venue: string;
  priceFrom: number;
  badge: string;
  soldPercent: number;
  cta: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'BlackPink World Tour',
    subtitle: 'Born Pink Encore — Hà Nội',
    tagline: 'Đêm nhạc bùng nổ — chỉ một đêm duy nhất',
    image: IMG.concert1,
    date: 'T7 · 28/06/2026 · 20:00',
    venue: 'SVĐ Mỹ Đình, Hà Nội',
    priceFrom: 1_500_000,
    badge: 'HOT · Sắp cháy vé',
    soldPercent: 87,
    cta: 'Mua vé ngay',
  },
  {
    id: 2,
    title: 'Sơn Tùng M-TP',
    subtitle: 'Sky Decade — 10 năm hành trình',
    tagline: 'Live concert kỷ niệm 10 năm sự nghiệp',
    image: IMG.concert2,
    date: 'CN · 12/07/2026 · 19:30',
    venue: 'SVĐ Quốc gia Mỹ Đình',
    priceFrom: 800_000,
    badge: 'Đang mở bán',
    soldPercent: 42,
    cta: 'Mua vé ngay',
  },
  {
    id: 3,
    title: 'Coldplay Music of the Spheres',
    subtitle: 'World Tour — Asia Leg',
    tagline: 'Trải nghiệm âm thanh ánh sáng đỉnh cao',
    image: IMG.concert3,
    date: 'T6 · 22/08/2026 · 19:00',
    venue: 'SVĐ Mỹ Đình, Hà Nội',
    priceFrom: 1_800_000,
    badge: 'Mới mở bán',
    soldPercent: 18,
    cta: 'Mua vé ngay',
  },
  {
    id: 4,
    title: 'EDM Festival — Neon Dreams',
    subtitle: 'Saigon Electric Night 2026',
    tagline: 'Hơn 15 DJ quốc tế hội tụ một sân khấu',
    image: IMG.edm,
    date: 'T7 · 09/08/2026 · 18:00',
    venue: 'SECC, TP. HCM',
    priceFrom: 650_000,
    badge: 'Đặc biệt',
    soldPercent: 55,
    cta: 'Khám phá',
  },
  {
    id: 5,
    title: 'Vietnam Tech Summit 2026',
    subtitle: 'AI, Web3 và Tương lai số',
    tagline: 'Diễn đàn công nghệ lớn nhất năm với 50+ diễn giả',
    image: IMG.tech,
    date: 'T5 · 15/05/2026 · 08:30',
    venue: 'GEM Center, TP. HCM',
    priceFrom: 500_000,
    badge: 'Diễn giả quốc tế',
    soldPercent: 64,
    cta: 'Đăng ký',
  },
  {
    id: 6,
    title: 'Hồ Thiên Nga — Royal Ballet',
    subtitle: 'Đêm diễn đặc biệt — Nhà hát Lớn',
    tagline: 'Tác phẩm kinh điển trở lại sau 5 năm',
    image: IMG.stage,
    date: 'T5 · 21/05/2026 · 19:30',
    venue: 'Nhà hát Lớn, Hà Nội',
    priceFrom: 400_000,
    badge: 'Limited edition',
    soldPercent: 71,
    cta: 'Đặt vé',
  },
];

export const TRENDING_CHIPS: string[] = [
  'BlackPink', 'Sơn Tùng M-TP', 'F1 Vietnam', 'Workshop AI',
  'Coldplay', 'Mỹ Tâm', 'Stand-up Comedy', 'Art Fair Hanoi',
  'Marathon HCMC', 'Festival Ẩm thực',
];

export const STATS = [
  { value: '1,200+', label: 'Sự kiện đang mở bán' },
  { value: '98K+',   label: 'Vé đã giao thành công' },
  { value: '24',     label: 'Tỉnh thành phủ sóng' },
  { value: '4.9',    label: 'Điểm hài lòng (5.0)' },
];

const baseEvents: MockEvent[] = [
  {
    id: 101, title: 'Live Jazz Night with Tuấn Ngọc', category: 'Âm nhạc', categoryKey: 'music',
    venue: 'Binh Minh Jazz Club', city: 'Hà Nội',
    date: '2026-04-26T20:00:00', dateLabel: 'T7, 26/04', timeLabel: '20:00',
    poster: IMG.jazz, priceFrom: 350_000, priceTo: 750_000, soldPercent: 72,
    badge: 'almost-sold', rankChange: 2, velocity: 18, organizer: 'Binh Minh Live',
  },
  {
    id: 102, title: 'EDM Festival — Neon Dreams', category: 'Âm nhạc', categoryKey: 'music',
    venue: 'Công viên Yên Sở', city: 'Hà Nội',
    date: '2026-04-27T18:00:00', dateLabel: 'CN, 27/04', timeLabel: '18:00',
    poster: IMG.edm, priceFrom: 600_000, priceTo: 2_500_000, soldPercent: 58,
    badge: 'hot', rankChange: 5, velocity: 32, organizer: 'Neon Events',
  },
  {
    id: 103, title: 'Triển lãm Mỹ thuật Đương đại', category: 'Nghệ thuật', categoryKey: 'arts',
    venue: 'VCCA — Vincom Royal City', city: 'Hà Nội',
    date: '2026-05-02T09:00:00', dateLabel: 'T6, 02/05', timeLabel: '09:00',
    poster: IMG.art, priceFrom: 80_000, priceTo: 150_000, soldPercent: 31,
    rankChange: 0, velocity: 6, organizer: 'VCCA',
  },
  {
    id: 104, title: 'Vietnam Tech Summit 2026', category: 'Công nghệ', categoryKey: 'tech',
    venue: 'GEM Center', city: 'TP. HCM',
    date: '2026-05-15T08:30:00', dateLabel: 'T5, 15/05', timeLabel: '08:30',
    poster: IMG.tech, priceFrom: 1_200_000, priceTo: 5_000_000, soldPercent: 64,
    badge: 'special', rankChange: 3, velocity: 14, organizer: 'TopDev',
  },
  {
    id: 105, title: 'Hà Nội FC vs HAGL', category: 'Thể thao', categoryKey: 'sports',
    venue: 'SVĐ Hàng Đẫy', city: 'Hà Nội',
    date: '2026-04-28T19:15:00', dateLabel: 'T2, 28/04', timeLabel: '19:15',
    poster: IMG.sport, priceFrom: 100_000, priceTo: 500_000, soldPercent: 45,
    rankChange: -1, velocity: 8, organizer: 'V-League',
  },
  {
    id: 106, title: 'Lễ hội Ẩm thực Đường phố', category: 'Ẩm thực', categoryKey: 'food',
    venue: 'Phố đi bộ Hồ Gươm', city: 'Hà Nội',
    date: '2026-05-03T16:00:00', dateLabel: 'T7, 03/05', timeLabel: '16:00',
    poster: IMG.food, priceFrom: 50_000, priceTo: 200_000, soldPercent: 28,
    badge: 'new', rankChange: 0, velocity: 5, organizer: 'Hanoi Foodie',
  },
  {
    id: 107, title: 'Stand-up Comedy Đêm Cười', category: 'Giải trí', categoryKey: 'entertainment',
    venue: 'Saigon Outcast', city: 'TP. HCM',
    date: '2026-04-26T21:00:00', dateLabel: 'T7, 26/04', timeLabel: '21:00',
    poster: IMG.comedy, priceFrom: 200_000, priceTo: 400_000, soldPercent: 81,
    badge: 'almost-sold', rankChange: 4, velocity: 22, organizer: 'Saigon Comedy',
  },
  {
    id: 108, title: 'Workshop AI cho người mới bắt đầu', category: 'Hội thảo', categoryKey: 'workshop',
    venue: 'Toong Coworking — Tràng Thi', city: 'Hà Nội',
    date: '2026-05-04T09:00:00', dateLabel: 'CN, 04/05', timeLabel: '09:00',
    poster: IMG.workshop, priceFrom: 300_000, priceTo: 500_000, soldPercent: 52,
    badge: 'new', rankChange: 6, velocity: 17, organizer: 'AI Vietnam',
  },
  {
    id: 109, title: 'Vở kịch Romeo & Juliet', category: 'Sân khấu', categoryKey: 'stage',
    venue: 'Nhà hát Lớn Hà Nội', city: 'Hà Nội',
    date: '2026-05-10T19:30:00', dateLabel: 'T7, 10/05', timeLabel: '19:30',
    poster: IMG.stage, priceFrom: 250_000, priceTo: 1_200_000, soldPercent: 38,
    rankChange: -2, velocity: 4, organizer: 'Nhà hát Tuổi Trẻ',
  },
  {
    id: 110, title: 'Mỹ Tâm Live Concert — Tri Âm', category: 'Âm nhạc', categoryKey: 'music',
    venue: 'Trung tâm Hội nghị Quốc gia', city: 'Hà Nội',
    date: '2026-06-08T20:00:00', dateLabel: 'CN, 08/06', timeLabel: '20:00',
    poster: IMG.concert2, priceFrom: 700_000, priceTo: 3_500_000, soldPercent: 91,
    badge: 'almost-sold', rankChange: 1, velocity: 26, organizer: 'My Tam Entertainment',
  },
];

export const TRENDING_LEADERBOARD: MockEvent[] = [...baseEvents]
  .sort((a, b) => (b.velocity ?? 0) - (a.velocity ?? 0))
  .slice(0, 8);

export const THIS_WEEK_EVENTS: MockEvent[] = baseEvents;
export const FOR_YOU_EVENTS: MockEvent[] = baseEvents.slice(2, 8);
export const NEW_EVENTS: MockEvent[] = [...baseEvents].reverse().slice(0, 8);

export const TIME_TABS = [
  { key: 'today',   label: 'Hôm nay' },
  { key: 'weekend', label: 'Cuối tuần' },
  { key: 'week',    label: 'Tuần này' },
  { key: 'month',   label: 'Tháng này' },
] as const;
export type TimeTabKey = typeof TIME_TABS[number]['key'];

export const TRUST_SIGNALS = [
  { icon: 'shield-check', title: 'Thanh toán an toàn',  desc: 'Bảo mật chuẩn PCI DSS · 3D-Secure · không lưu thẻ' },
  { icon: 'rotate-ccw',   title: 'Hoàn vé minh bạch',   desc: 'Chính sách hoàn rõ ràng theo từng sự kiện' },
  { icon: 'headphones',   title: 'Hỗ trợ 24/7',         desc: 'Đội ngũ CSKH phản hồi trong 5 phút' },
];

export const FOOTER_LINKS = {
  company: [
    { label: 'Về TicketRush', href: '#' },
    { label: 'Tuyển dụng',    href: '#' },
    { label: 'Tin tức',       href: '#' },
    { label: 'Liên hệ',       href: '#' },
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
    { label: 'Chính sách hoàn vé', href: '#' },
    { label: 'Điều khoản dịch vụ', href: '#' },
  ],
};

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

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Mỹ Tâm hé lộ sân khấu "Tri Âm" 2026 với công nghệ trình diễn 360°',
    excerpt: 'Nữ ca sĩ tiết lộ ê-kíp sản xuất đang hợp tác cùng studio Hàn Quốc để dựng sân khấu xoay 360 độ với hơn 500 thiết bị ánh sáng, hứa hẹn bùng nổ.',
    category: 'Showbiz',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80',
    publishedAt: '2 giờ trước',
    readMin: 4,
    featured: true,
  },
  {
    id: 'n2',
    title: 'Top 5 lễ hội âm nhạc không thể bỏ lỡ trong tháng 5',
    excerpt: 'Từ EDM ngoài trời đến jazz thính phòng, đây là danh sách sự kiện âm nhạc đáng mong chờ nhất tháng tới.',
    category: 'Sự kiện',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    publishedAt: '5 giờ trước',
    readMin: 3,
  },
  {
    id: 'n3',
    title: 'Phỏng vấn Đen Vâu: "Tôi muốn mỗi live show là một bức tranh quê"',
    excerpt: 'Rapper chia sẻ quá trình chuẩn bị tour xuyên Việt và những câu chuyện phía sau từng ca khúc.',
    category: 'Phỏng vấn',
    cover: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    publishedAt: '1 ngày trước',
    readMin: 6,
  },
  {
    id: 'n4',
    title: 'Nhà hát Lớn Hà Nội công bố mùa diễn mới với 12 vở kịch kinh điển',
    excerpt: 'Mùa diễn 2026 – 2027 hứa hẹn mang đến những vở kịch đình đám từ Shakespeare tới Lưu Quang Vũ.',
    category: 'Sân khấu',
    cover: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
    publishedAt: '2 ngày trước',
    readMin: 5,
  },
  {
    id: 'n5',
    title: 'Cách săn vé sớm với giá tốt: 5 mẹo từ các "fan cứng"',
    excerpt: 'Bí quyết để không bỏ lỡ đợt early-bird và giữ được chỗ đẹp trong các sự kiện hot.',
    category: 'Mẹo hay',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    publishedAt: '3 ngày trước',
    readMin: 4,
  },
];
