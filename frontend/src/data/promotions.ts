// Static promotions/voucher data — displayed on /promotions page.
// In production these would come from the promo_codes API endpoint.

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  type: 'percent' | 'fixed' | 'cashback' | 'shipping';
  value: number;
  category: 'all' | 'new-user' | 'concert' | 'sport' | 'workshop' | 'theatre';
  minSpend?: number;
  expiresAt: string; // ISO
  usedPercent: number;
  tag?: 'hot' | 'new' | 'flash' | 'vip';
  sponsor?: string;
  sponsorColor?: string;
}

export const PROMOTIONS: Promotion[] = [
  {
    id: 'p1',
    title: 'Chào mừng thành viên mới',
    subtitle: 'Giảm 10% cho lần mua vé đầu tiên trên TicketRush',
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    category: 'new-user',
    minSpend: 500_000,
    expiresAt: '2026-12-31T23:59:59',
    usedPercent: 42,
    tag: 'new',
    sponsor: 'TicketRush',
    sponsorColor: 'bg-amber-500',
  },
  {
    id: 'p2',
    title: 'Mùa concert tháng 5',
    subtitle: 'Giảm 15% cho tất cả vé concert trong tháng 5/2026',
    code: 'MAY2026',
    type: 'percent',
    value: 15,
    category: 'concert',
    minSpend: 1_000_000,
    expiresAt: '2026-05-31T23:59:59',
    usedPercent: 67,
    tag: 'hot',
    sponsor: 'TicketRush',
    sponsorColor: 'bg-rose-500',
  },
  {
    id: 'p3',
    title: 'EXO Fan Exclusive',
    subtitle: 'Giảm 300.000đ cho fan đặt vé EXO PLANET #6 — số lượng có hạn!',
    code: 'EXOVIET',
    type: 'fixed',
    value: 300_000,
    category: 'concert',
    minSpend: 2_000_000,
    expiresAt: '2026-04-30T23:59:59',
    usedPercent: 89,
    tag: 'flash',
    sponsor: 'EXO Fan Club VN',
    sponsorColor: 'bg-purple-600',
  },
  {
    id: 'p4',
    title: 'Summer Saving',
    subtitle: 'Giảm 150.000đ cho mọi sự kiện mùa hè từ tháng 6–8/2026',
    code: 'SUMMER150K',
    type: 'fixed',
    value: 150_000,
    category: 'all',
    minSpend: 800_000,
    expiresAt: '2026-08-31T23:59:59',
    usedPercent: 18,
    tag: 'new',
    sponsor: 'TicketRush',
    sponsorColor: 'bg-teal-500',
  },
  {
    id: 'p5',
    title: 'AI Summit Early Bird',
    subtitle: 'Giảm 20% khi đăng ký trước Vietnam AI Summit 2026',
    code: 'AIEARLY',
    type: 'percent',
    value: 20,
    category: 'workshop',
    minSpend: 2_500_000,
    expiresAt: '2026-05-10T23:59:59',
    usedPercent: 74,
    tag: 'flash',
    sponsor: 'Vietnam AI Alliance',
    sponsorColor: 'bg-indigo-600',
  },
  {
    id: 'p6',
    title: 'Hip-hop Fans',
    subtitle: 'Giảm 50.000đ vé BADASS CITY 2026 — áp dụng cả vé standing',
    code: 'HIPHOP50K',
    type: 'fixed',
    value: 50_000,
    category: 'concert',
    minSpend: 250_000,
    expiresAt: '2026-05-03T23:59:59',
    usedPercent: 55,
    tag: 'hot',
    sponsor: 'Badass Entertainment',
    sponsorColor: 'bg-stone-900',
  },
  {
    id: 'p7',
    title: 'Kịch Cuối Tuần',
    subtitle: 'Mua 2 vé IDECAF tặng thêm 100.000đ vào ví TicketRush',
    code: 'IDECAF2VE',
    type: 'cashback',
    value: 10,
    category: 'theatre',
    minSpend: 500_000,
    expiresAt: '2026-05-31T23:59:59',
    usedPercent: 31,
    tag: 'new',
    sponsor: 'IDECAF',
    sponsorColor: 'bg-violet-600',
  },
  {
    id: 'p8',
    title: 'Thể thao VIP',
    subtitle: 'Giảm 50.000đ vé V-League — dành cho hội viên TicketRush',
    code: 'VLEAGUE50',
    type: 'fixed',
    value: 50_000,
    category: 'sport',
    minSpend: 150_000,
    expiresAt: '2026-06-30T23:59:59',
    usedPercent: 22,
    tag: 'vip',
    sponsor: 'VPF',
    sponsorColor: 'bg-emerald-600',
  },
];
