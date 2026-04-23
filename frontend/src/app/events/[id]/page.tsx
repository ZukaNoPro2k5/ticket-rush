'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Calendar, Clock, ChevronRight, Share2, Heart, Flame,
  Ticket, Star, Check, Info, Users, Building2, ArrowRight,
  ChevronDown,
} from 'lucide-react';
import {
  THIS_WEEK_EVENTS, CATEGORIES, formatVnd, type MockEvent,
} from '@/lib/mockHomeData';

type TabKey = 'about' | 'lineup' | 'venue' | 'faq' | 'reviews';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'about',   label: 'Giới thiệu' },
  { key: 'lineup',  label: 'Chương trình' },
  { key: 'venue',   label: 'Địa điểm' },
  { key: 'faq',     label: 'Hỏi đáp' },
  { key: 'reviews', label: 'Đánh giá' },
];

const MOCK_ZONES = [
  { name: 'VIP Đứng Sân khấu', price: 3_500_000, available: 12,  total: 120, color: 'bg-rose-500',    desc: 'Khu vực đứng sát sân khấu, view đẹp nhất' },
  { name: 'Premium (A-B)',      price: 2_200_000, available: 48,  total: 200, color: 'bg-amber-500',   desc: 'Ghế ngồi hàng đầu, không khuất tầm nhìn' },
  { name: 'Standard (C-F)',     price: 1_200_000, available: 120, total: 400, color: 'bg-sky-500',     desc: 'Ghế ngồi trung tâm, âm thanh tốt' },
  { name: 'Economy (G-J)',      price: 600_000,   available: 180, total: 300, color: 'bg-emerald-500', desc: 'Ghế ngồi phía sau, tiết kiệm' },
];

const MOCK_LINEUP = [
  { time: '19:00 - 19:30', title: 'Đón khách & check-in', desc: 'Mở cửa, kiểm tra vé, check-in ảnh' },
  { time: '19:30 - 20:00', title: 'Opening Act', desc: 'Màn trình diễn mở màn từ nghệ sĩ trẻ' },
  { time: '20:00 - 21:30', title: 'Main Concert', desc: 'Phần biểu diễn chính — 90 phút bùng nổ' },
  { time: '21:30 - 22:00', title: 'Encore & Meet-and-Greet', desc: 'Gặp gỡ nghệ sĩ và chụp ảnh kỷ niệm' },
];

const MOCK_FAQ = [
  { q: 'Tôi có thể đổi/trả vé sau khi mua không?', a: 'Vé đã mua không đổi/trả, trừ trường hợp sự kiện bị hủy bởi BTC. Khi đó bạn sẽ được hoàn 100% giá trị vé qua phương thức thanh toán ban đầu.' },
  { q: 'Trẻ em có cần mua vé riêng?', a: 'Trẻ em dưới 6 tuổi được miễn phí vào cửa khi đi cùng người lớn có vé và không chiếm ghế. Trẻ từ 6 tuổi cần mua vé như người lớn.' },
  { q: 'Tôi nhận vé như thế nào?', a: 'Sau khi thanh toán thành công, e-ticket (QR code) sẽ được gửi qua email trong 5 phút. Bạn chỉ cần xuất trình mã QR tại cửa.' },
  { q: 'Có được mang đồ ăn, nước uống vào không?', a: 'Không mang đồ ăn/nước uống từ bên ngoài. Khu vực sự kiện có quầy F&B với nhiều lựa chọn.' },
  { q: 'Địa điểm có chỗ đỗ xe không?', a: 'Có bãi gửi xe máy và ôtô tại cổng phía Đông. Phí gửi theo giá niêm yết của SVĐ.' },
];

const MOCK_REVIEWS = [
  { name: 'Nguyễn Minh Anh', rating: 5, date: '2 ngày trước', text: 'Sự kiện cực kỳ chất lượng! Âm thanh ánh sáng đỉnh cao, nghệ sĩ rất gần gũi với khán giả. Chắc chắn sẽ đi tiếp nếu có tour sau.' },
  { name: 'Trần Quang Huy', rating: 5, date: '1 tuần trước', text: 'Mua vé cực nhanh, nhận QR qua email trong 2 phút. BTC rất chuyên nghiệp. Recommend 100%.' },
  { name: 'Lê Thảo Nguyên', rating: 4, date: '2 tuần trước', text: 'Nhìn chung ổn, chỉ có điều khu vực Economy hơi xa sân khấu. Lần sau sẽ chọn Standard.' },
];

// ─── Mini navbar ─────────────────────────────────────────
function DetailNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-stone-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-white shadow-lift">
            <Ticket className="h-5 w-5" strokeWidth={2.5} />
          </span>
          TicketRush
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">Trang chủ</Link>
          <Link href="/events" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">Sự kiện</Link>
          <Link href="#" className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-900">Tổ chức sự kiện</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:border-stone-400 hover:text-rose-500">
            <Heart className="h-4 w-4" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Page ───────────────────────────────────────────────
export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = Number(params?.id) || 101;

  const event: MockEvent = useMemo(() => {
    return THIS_WEEK_EVENTS.find((e) => e.id === eventId) ?? THIS_WEEK_EVENTS[0];
  }, [eventId]);

  const categoryDef = CATEGORIES.find((c) => c.key === event.categoryKey);
  const similar = THIS_WEEK_EVENTS.filter((e) => e.id !== event.id).slice(0, 4);

  const [tab, setTab] = useState<TabKey>('about');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const minPrice = Math.min(...MOCK_ZONES.map((z) => z.price));
  const maxPrice = Math.max(...MOCK_ZONES.map((z) => z.price));

  return (
    <main className="min-h-screen bg-stone-50 pb-24 lg:pb-0">
      <DetailNavbar />

      {/* Hero */}
      <section className="relative h-[360px] w-full overflow-hidden md:h-[480px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.poster} alt={event.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-stone-900/20" />

        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 lg:px-8">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-white/70">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/events" className="hover:text-white">Sự kiện</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{event.category}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {event.badge === 'hot' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lift">
                <Flame className="h-3.5 w-3.5" /> HOT
              </span>
            )}
            {event.badge === 'almost-sold' && (
              <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lift">Sắp cháy vé</span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              <i className={`${categoryDef?.icon ?? 'fa-solid fa-tag'} text-amber-300`} aria-hidden /> {event.category}
            </span>
          </div>

          <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold text-white md:text-5xl">{event.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-amber-300" /> {event.dateLabel}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-300" /> {event.timeLabel}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-amber-300" /> {event.venue}, {event.city}</span>
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> 4.8 (126 đánh giá)</span>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px] lg:px-8">
        {/* Left content */}
        <div>
          {/* Tabs */}
          <div className="sticky top-16 z-20 -mx-4 mb-6 border-b border-stone-200 bg-stone-50/95 px-4 backdrop-blur-md lg:-mx-8 lg:px-8">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative flex-shrink-0 px-4 py-3.5 text-sm font-semibold transition-colors
                    ${tab === t.key ? 'text-amber-700' : 'text-stone-500 hover:text-stone-900'}`}
                >
                  {t.label}
                  {tab === t.key && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-amber-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {tab === 'about' && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
                <h2 className="font-display text-xl font-bold">Giới thiệu sự kiện</h2>
                <div className="mt-4 space-y-4 text-stone-700 leading-relaxed">
                  <p>
                    Chào mừng quý khán giả đến với <strong>{event.title}</strong> — một trong những sự kiện được mong chờ nhất năm 2026. Diễn ra tại <strong>{event.venue}</strong>, đây sẽ là đêm bùng nổ cảm xúc với âm thanh ánh sáng đỉnh cao, quy tụ dàn nghệ sĩ hàng đầu trong và ngoài nước.
                  </p>
                  <p>
                    Ban tổ chức đã chuẩn bị một sân khấu quy mô lớn với công nghệ LED 4K, hệ thống âm thanh Line Array chuẩn quốc tế, cùng đội ngũ sản xuất giàu kinh nghiệm từng thực hiện nhiều chương trình lớn như Monsoon Music Festival, HAY Festival và nhiều sự kiện quốc tế khác.
                  </p>
                  <p>
                    Đặc biệt, trong đêm diễn sẽ có phần giao lưu Meet-and-Greet — cơ hội hiếm có để khán giả gặp gỡ trực tiếp các nghệ sĩ thần tượng. Đừng bỏ lỡ!
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Users, label: '15,000+ khán giả' },
                    { icon: Clock, label: 'Thời lượng 3 tiếng' },
                    { icon: Building2, label: 'SVĐ ngoài trời' },
                    { icon: Info, label: 'Độ tuổi 12+' },
                  ].map((f, i) => (
                    <div key={i} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-center">
                      <f.icon className="mx-auto h-5 w-5 text-amber-600" />
                      <div className="mt-1 text-xs font-semibold text-stone-700">{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zones preview */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">Hạng vé & giá</h2>
                  <Link href={`/events/${event.id}/seats`} className="text-sm font-semibold text-amber-700 hover:text-amber-800">
                    Xem sơ đồ ghế →
                  </Link>
                </div>
                <div className="space-y-3">
                  {MOCK_ZONES.map((z) => {
                    const soldPct = Math.round(((z.total - z.available) / z.total) * 100);
                    return (
                      <div key={z.name} className="flex items-center gap-4 rounded-2xl border border-stone-200 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/30">
                        <div className={`h-12 w-2 flex-shrink-0 rounded-full ${z.color}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="truncate font-semibold text-stone-900">{z.name}</h4>
                            <div className="font-display text-lg font-bold text-amber-700">{formatVnd(z.price)}</div>
                          </div>
                          <div className="mt-0.5 text-xs text-stone-500">{z.desc}</div>
                          <div className="mt-2 flex items-center gap-3 text-[11px] text-stone-500">
                            <span>Còn {z.available}/{z.total}</span>
                            <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-100">
                              <div className={`h-full rounded-full ${soldPct >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`} style={{ width: `${soldPct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Organizer */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
                <h2 className="mb-4 font-display text-xl font-bold">Đơn vị tổ chức</h2>
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 font-display text-xl font-bold text-white shadow-lift">
                    {(event.organizer ?? 'TR').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-stone-900">{event.organizer ?? 'TicketRush Events'}</h3>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-stone-500">
                      <span>12 sự kiện đã tổ chức</span>
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> 4.9</span>
                    </div>
                  </div>
                  <button className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:border-amber-500 hover:text-amber-700">
                    Theo dõi
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'lineup' && (
            <div className="animate-fadeInUp rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
              <h2 className="font-display text-xl font-bold">Chương trình chi tiết</h2>
              <ol className="mt-5 space-y-5 border-l-2 border-amber-200 pl-6">
                {MOCK_LINEUP.map((item, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-xs font-bold text-white ring-4 ring-white">
                      {i + 1}
                    </span>
                    <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">{item.time}</div>
                    <h3 className="mt-0.5 font-semibold text-stone-900">{item.title}</h3>
                    <p className="mt-0.5 text-sm text-stone-600">{item.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tab === 'venue' && (
            <div className="animate-fadeInUp space-y-5">
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft">
                <div className="relative aspect-[16/9] bg-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://maps.googleapis.com/maps/api/staticmap?center=Hanoi&zoom=13&size=1200x600&maptype=roadmap&markers=color:0xd97706%7CHanoi"
                    alt="Bản đồ"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h2 className="font-display text-xl font-bold">{event.venue}</h2>
                  <p className="mt-1 text-sm text-stone-500">{event.venue}, {event.city}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: 'Sức chứa', value: '25,000 chỗ' },
                      { label: 'Bãi đỗ xe', value: 'Có (có phí)' },
                      { label: 'Phương tiện', value: 'Xe bus, Grab, Taxi' },
                    ].map((x, i) => (
                      <div key={i} className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                        <div className="text-[11px] uppercase tracking-wider text-stone-500">{x.label}</div>
                        <div className="mt-0.5 font-semibold text-stone-900">{x.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'faq' && (
            <div className="animate-fadeInUp rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
              <h2 className="font-display text-xl font-bold">Câu hỏi thường gặp</h2>
              <div className="mt-4 divide-y divide-stone-100">
                {MOCK_FAQ.map((f, i) => (
                  <div key={i} className="py-3">
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="font-semibold text-stone-900">{f.q}</span>
                      <ChevronDown className={`h-5 w-5 flex-shrink-0 text-stone-400 transition-transform ${faqOpen === i ? 'rotate-180 text-amber-600' : ''}`} />
                    </button>
                    {faqOpen === i && (
                      <p className="mt-2 animate-fadeIn text-sm text-stone-600">{f.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="animate-fadeInUp space-y-4">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft lg:p-8">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="font-display text-5xl font-bold text-amber-700">4.8</div>
                    <div className="mt-1 flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-4 w-4 ${n <= 4 ? 'fill-amber-500 text-amber-500' : 'fill-amber-500/60 text-amber-500/60'}`} />
                      ))}
                    </div>
                    <div className="mt-0.5 text-xs text-stone-500">126 đánh giá</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[{ s: 5, p: 78 }, { s: 4, p: 15 }, { s: 3, p: 5 }, { s: 2, p: 1 }, { s: 1, p: 1 }].map((r) => (
                      <div key={r.s} className="flex items-center gap-3 text-xs">
                        <span className="w-3 text-stone-500">{r.s}</span>
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: `${r.p}%` }} />
                        </div>
                        <span className="w-8 text-right text-stone-500">{r.p}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {MOCK_REVIEWS.map((r, i) => (
                <div key={i} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-100 font-bold text-amber-700">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">{r.name}</div>
                      <div className="text-xs text-stone-500">{r.date}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-stone-700">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right rail CTA (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lift">
              <div className="text-[11px] uppercase tracking-wider text-stone-500">Giá vé</div>
              <div className="mt-1 font-display text-2xl font-bold text-stone-900">
                {formatVnd(minPrice)} <span className="text-sm font-medium text-stone-500">- {formatVnd(maxPrice)}</span>
              </div>

              <div className="mt-4 space-y-2 rounded-2xl bg-amber-50 p-3">
                <div className="flex items-center gap-2 text-sm text-amber-900">
                  <Check className="h-4 w-4" /> Miễn phí đổi trả trong 24h
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-900">
                  <Check className="h-4 w-4" /> Nhận QR ngay sau thanh toán
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-900">
                  <Check className="h-4 w-4" /> Hỗ trợ 24/7
                </div>
              </div>

              <Link
                href={`/events/${event.id}/seats`}
                className="mt-5 group flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 py-3.5 font-semibold text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-600"
              >
                Chọn vé ngay <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400">
                <Heart className="h-4 w-4" /> Lưu sự kiện
              </button>

              <div className="mt-5 border-t border-stone-100 pt-4">
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Tiến độ bán vé</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{event.soldPercent}% đã bán</span>
                  {event.soldPercent >= 80 && <span className="text-xs font-bold text-orange-600">Sắp cháy vé</span>}
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div className={`h-full rounded-full ${event.soldPercent >= 80 ? 'bg-orange-500' : 'bg-amber-500'}`} style={{ width: `${event.soldPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Similar events */}
      <section className="border-t border-stone-200 bg-stone-100/50 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Sự kiện tương tự</h2>
              <p className="mt-1 text-sm text-stone-500">Có thể bạn cũng sẽ thích</p>
            </div>
            <Link href="/events" className="text-sm font-semibold text-amber-700 hover:text-amber-800">Xem tất cả →</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((ev) => (
              <Link key={ev.id} href={`/events/${ev.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ev.poster} alt={ev.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">{ev.category}</span>
                  <h3 className="mt-1 line-clamp-2 font-semibold text-stone-900 group-hover:text-amber-700">{ev.title}</h3>
                  <div className="mt-1 text-xs text-stone-500"><Calendar className="mr-0.5 inline h-3 w-3" /> {ev.dateLabel} · {ev.timeLabel}</div>
                  <div className="mt-auto pt-3 font-display text-sm font-bold text-amber-700">Từ {formatVnd(ev.priceFrom)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md shadow-lift lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Từ</div>
            <div className="font-display text-lg font-bold text-amber-700">{formatVnd(minPrice)}</div>
          </div>
          <Link
            href={`/events/${event.id}/seats`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-500 py-3 text-sm font-semibold text-white shadow-lift transition-all hover:bg-amber-600"
          >
            Chọn vé ngay <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
