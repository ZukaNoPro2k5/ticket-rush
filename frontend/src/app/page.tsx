'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, User, Globe } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────

interface EventItem {
  id: number;
  name: string;
  price: string;
  date: string;
  image: string;
  badge?: string;
}

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

// ─── Helpers ─────────────────────────────────────────────────────

const img = (id: string, w = 400, h = 250) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop`;

// ─── Mock Data ───────────────────────────────────────────────────

const heroSlides: HeroSlide[] = [
  { id: 1, image: img('1470229722913-7c0e2dbbafd3', 1600, 500), title: 'Concert Đêm Nhạc Việt 2026', subtitle: '15 Tháng 4 • Nhà hát Lớn Hà Nội' },
  { id: 2, image: img('1501281668745-f7f57925c3b4', 1600, 500), title: 'Lễ hội Âm nhạc Quốc tế', subtitle: '20–22 Tháng 4 • Công viên Yên Sở' },
  { id: 3, image: img('1492684223066-81342ee5ff30', 1600, 500), title: 'Festival Hòa Minzy & Friends', subtitle: '25 Tháng 4 • Sân vận động Mỹ Đình' },
  { id: 4, image: img('1459749411175-04bf5292ceea', 1600, 500), title: 'Đêm Nhạc Trịnh Công Sơn', subtitle: '30 Tháng 4 • Nhà hát Lớn TP.HCM' },
];

const trendingEvents: EventItem[] = [
  { id: 1, name: 'Lễ hội Âm nhạc Quốc tế', price: '500.000đ', date: '15/04', image: img('1470229722913-7c0e2dbbafd3') },
  { id: 2, name: 'Concert Acoustic Live', price: '300.000đ', date: '18/04', image: img('1501281668745-f7f57925c3b4') },
  { id: 3, name: 'Nhạc kịch "Giấc Mơ"', price: '450.000đ', date: '20/04', image: img('1503095396549-807759245b35') },
  { id: 4, name: 'Triển lãm Nghệ thuật Đương đại', price: '200.000đ', date: '22/04', image: img('1460661419201-fd4cecdf8a8b') },
  { id: 5, name: 'Stand-up Comedy Night', price: '250.000đ', date: '23/04', image: img('1527224538127-2104bb71c51b') },
];

const forYouEvents: EventItem[] = [
  { id: 6, name: 'Workshop Nhiếp ảnh', price: '350.000đ', date: '16/04', image: img('1452587925148-ce544e77e70d') },
  { id: 7, name: 'Đêm Nhạc Jazz', price: '400.000đ', date: '19/04', image: img('1415201364774-f6f0bb35f28f') },
  { id: 8, name: 'Kịch Sân khấu "Mùa Xuân"', price: '320.000đ', date: '21/04', image: img('1507676184212-d03ab07a01bf') },
  { id: 9, name: 'Hội thảo Khởi nghiệp', price: '150.000đ', date: '23/04', image: img('1475721027785-f74eccf877e2') },
];

const newEvents: EventItem[] = [
  { id: 10, name: 'Festival Ẩm thực Đường phố', price: '250.000đ', date: '17/04', image: img('1555939594-58d7cb561ad1') },
  { id: 11, name: 'Yoga & Meditation Retreat', price: '180.000đ', date: '19/04', image: img('1545205597-3d9d02c29597') },
  { id: 12, name: 'Trận bóng đá Giao hữu', price: '100.000đ', date: '20/04', image: img('1522778119026-d647f0596c20') },
  { id: 13, name: 'Buổi hòa nhạc Giao hưởng', price: '600.000đ', date: '24/04', image: img('1465847899084-d164df4dedc6') },
];

const almostSoldOutEvents: EventItem[] = [
  { id: 14, name: 'Đêm Nhạc Rock Việt', price: '380.000đ', date: '16/04', image: img('1498038432885-c6f3f1b912ee'), badge: 'Còn 5 vé' },
  { id: 15, name: 'Triển lãm Công nghệ VR', price: 'Miễn phí', date: '18/04', image: img('1518770660439-4636190af475'), badge: 'Còn 3 vé' },
  { id: 16, name: 'Marathon Thành phố HN', price: '200.000đ', date: '21/04', image: img('1452626038306-9aae5e071dd3'), badge: 'Còn 8 vé' },
  { id: 17, name: 'Lớp Vẽ Tranh Sơn dầu', price: '280.000đ', date: '23/04', image: img('1460661419201-fd4cecdf8a8b'), badge: 'Còn 2 vé' },
];

const freeEvents: EventItem[] = [
  { id: 18, name: 'Hội chợ Sách miễn phí', price: 'Miễn phí', date: '17/04', image: img('1481627834876-b7833e8f5570') },
  { id: 19, name: 'Buổi giao lưu Cộng đồng Dev', price: 'Miễn phí', date: '19/04', image: img('1511632765486-a01980e01a18') },
  { id: 20, name: 'Workshop Marketing Online', price: '50.000đ', date: '20/04', image: img('1542744173-8e7e53415bb0') },
  { id: 21, name: 'Ngày Văn hóa Đường phố', price: 'Miễn phí', date: '22/04', image: img('1533174072545-7a4b6ad7a6c3') },
];

const weekendEvents: EventItem[] = [
  { id: 22, name: 'Picnic Cuối tuần Hồ Tây', price: '120.000đ', date: '12–13/04', image: img('1506126613408-eca07ce68773') },
  { id: 23, name: 'Đêm Phim Ngoài trời', price: '80.000đ', date: '12–13/04', image: img('1489599849927-2ee91cede3ba') },
  { id: 24, name: 'Chợ phiên Cuối tuần', price: 'Miễn phí', date: '12–13/04', image: img('1533900298318-6b8da08a523e') },
  { id: 25, name: 'Tour Du lịch Tam Đảo 1 ngày', price: '550.000đ', date: '13/04', image: img('1476514525535-07fb3b4ae5f1') },
];

// Category events
const musicEvents: EventItem[] = [
  { id: 26, name: 'Live Band Acoustic Night', price: '280.000đ', date: '14/04', image: img('1511379938547-c1f69419868d') },
  { id: 27, name: 'DJ Night Party', price: '350.000đ', date: '15/04', image: img('1470225620780-dba8ba36b745') },
  { id: 28, name: 'Đêm Nhạc Trịnh', price: '400.000đ', date: '18/04', image: img('1514320291840-2e0a9bf2a9ae') },
  { id: 29, name: 'Concert Pop Việt Nam', price: '500.000đ', date: '20/04', image: img('1501386761578-eac5c94b800a') },
];

const theaterEvents: EventItem[] = [
  { id: 30, name: 'Vở kịch "Số Đỏ"', price: '350.000đ', date: '16/04', image: img('1503095396549-807759245b35') },
  { id: 31, name: 'Ballet Hồ Thiên Nga', price: '600.000đ', date: '19/04', image: img('1518834107812-67b0b7c58434') },
  { id: 32, name: 'Kịch hài Tết Nguyên Đán', price: '280.000đ', date: '21/04', image: img('1507676184212-d03ab07a01bf') },
  { id: 33, name: 'Opera "La Traviata"', price: '750.000đ', date: '25/04', image: img('1580809361436-42a7ec204889') },
];

const sportsEvents: EventItem[] = [
  { id: 34, name: 'Chung kết Bóng đá V-League', price: '150.000đ', date: '13/04', image: img('1431324155629-1a6deb1dec8d') },
  { id: 35, name: 'Giải Tennis Mở rộng HN', price: '200.000đ', date: '17/04', image: img('1622279457486-62dcc4a431d6') },
  { id: 36, name: 'Marathon 42km Hà Nội', price: '300.000đ', date: '20/04', image: img('1452626038306-9aae5e071dd3') },
  { id: 37, name: 'Giải Bóng chuyền QG', price: '100.000đ', date: '23/04', image: img('1612872087720-bb876e2e67d1') },
];

const workshopEvents: EventItem[] = [
  { id: 38, name: 'Workshop Thiết kế UI/UX', price: '450.000đ', date: '15/04', image: img('1559028012-481c04fa702d') },
  { id: 39, name: 'Hội thảo Đầu tư Tài chính', price: '200.000đ', date: '18/04', image: img('1560472355-536de3962603') },
  { id: 40, name: 'Lớp Nấu ăn Chuyên nghiệp', price: '380.000đ', date: '21/04', image: img('1556910103-1c02745aae4d') },
  { id: 41, name: 'Workshop Nhiếp ảnh Chân dung', price: '320.000đ', date: '24/04', image: img('1542038784456-1ea8e935640e') },
];

const experienceEvents: EventItem[] = [
  { id: 42, name: 'Tour Phố cổ Hà Nội', price: '250.000đ', date: '14/04', image: img('1555400038-63f5ba517a47') },
  { id: 43, name: 'Trải nghiệm Làm Gốm', price: '180.000đ', date: '17/04', image: img('1565193566173-7a0ee3dbe261') },
  { id: 44, name: 'Cắm trại Núi Bà Đen', price: '350.000đ', date: '19–20/04', image: img('1478131143081-80f7f84ca84d') },
  { id: 45, name: 'Chèo thuyền Kayak Hạ Long', price: '480.000đ', date: '22/04', image: img('1544551763-46a013bb70d5') },
];

const otherEvents: EventItem[] = [
  { id: 46, name: 'Hội chợ Thú cưng Hà Nội', price: '80.000đ', date: '16/04', image: img('1450778869180-41d0601e046e') },
  { id: 47, name: 'Triển lãm Ô tô Quốc tế', price: 'Miễn phí', date: '19/04', image: img('1492144534655-ae79c964c9d7') },
  { id: 48, name: 'Ngày hội Cosplay Việt Nam', price: '150.000đ', date: '21/04', image: img('1608889335941-32ac5f2041b9') },
  { id: 49, name: 'Hội thảo Công nghệ AI', price: '300.000đ', date: '24/04', image: img('1485827404703-89b55fcc595e') },
];

const categories = [
  { id: 'nhac-song', name: 'Nhạc sống', events: musicEvents },
  { id: 'san-khau', name: 'Sân khấu & Nghệ thuật', events: theaterEvents },
  { id: 'the-thao', name: 'Thể thao', events: sportsEvents },
  { id: 'workshop', name: 'Hội thảo & Workshop', events: workshopEvents },
  { id: 'trai-nghiem', name: 'Tham quan & Trải nghiệm', events: experienceEvents },
  { id: 'khac', name: 'Khác', events: otherEvents },
];

// ─── Page ────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroCarousel />
      <TrendingBar />

      <main className="max-w-[1200px] mx-auto px-6 pt-2 pb-8">
        <EventSection title="Xu hướng" icon="🔥" events={trendingEvents} showRanking />
        <EventSection title="Dành cho bạn" icon="💡" events={forYouEvents} />
        <EventSection title="Sự kiện mới" icon="🆕" events={newEvents} />
        <EventSection title="Sắp hết vé" icon="🎯" events={almostSoldOutEvents} />
        <EventSection title="Miễn phí & Giá rẻ" icon="🆓" events={freeEvents} />
        <EventSection title="Cuối tuần này" icon="📅" events={weekendEvents} showViewMore />

        <div className="my-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">Theo danh mục</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>

        {categories.map((cat) => (
          <EventSection
            key={cat.id}
            id={cat.id}
            title={cat.name}
            events={cat.events}
            showViewMore
          />
        ))}
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Row 1: Logo · Search · Actions */}
        <div className="flex items-center justify-between h-16">
          <a href="/" className="text-2xl font-bold text-navy shrink-0">
            <span className="text-brand">Ticket</span>Rush
          </a>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm sự kiện, nghệ sĩ, địa điểm..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-navy rounded-lg hover:bg-gray-50 transition-colors">
              <Globe size={16} />
              <span>VN</span>
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button className="flex items-center gap-2 ml-1 px-5 py-2 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand-dark transition-colors">
              <User size={16} />
              Đăng nhập
            </button>
          </div>
        </div>

        {/* Row 2: Category anchors */}
        <div className="flex items-center gap-6 h-10 text-sm overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="text-gray-500 hover:text-brand font-medium transition-colors whitespace-nowrap"
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── Hero Carousel ───────────────────────────────────────────────

function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = heroSlides.length;

  const goTo = useCallback(
    (index: number) => setCurrent(((index % total) + total) % total),
    [total],
  );

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => goTo(current + 1), 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, current, goTo]);

  return (
    <div
      className="relative overflow-hidden group/hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(.25,.1,.25,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {heroSlides.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0 relative h-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-end pb-16">
              <div className="max-w-[1200px] mx-auto px-6 w-full">
                <div className="max-w-lg">
                  <p className="text-brand text-xs font-semibold tracking-wider uppercase mb-2">Nổi bật</p>
                  <h2 className="text-3xl md:text-[2.75rem] font-bold text-white mb-2 leading-[1.15]">
                    {slide.title}
                  </h2>
                  <p className="text-white/70 text-sm mb-6">{slide.subtitle}</p>
                  <button className="group/btn relative px-7 py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-dark transition-all text-sm overflow-hidden">
                    <span className="relative z-10">Mua vé ngay</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-brand opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrows — tall pill, frosted glass */}
      <button
        onClick={() => goTo(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-24 flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-md text-white/70 hover:bg-black/40 hover:text-white opacity-0 group-hover/hero:opacity-100 transition-all duration-300"
      >
        <ChevronLeft size={22} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => goTo(current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-24 flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-md text-white/70 hover:bg-black/40 hover:text-white opacity-0 group-hover/hero:opacity-100 transition-all duration-300"
      >
        <ChevronRight size={22} strokeWidth={2.5} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Trending Bar ────────────────────────────────────────────────

const hotItems = [
  'Concert Mỹ Tâm', 'Đêm Nhạc Trịnh', 'Festival Hoà Minzy',
  'Giải Marathon TP.HCM', 'Workshop UI/UX Design', 'Stand-up Comedy Night',
];

function TrendingBar() {
  return (
    <div className="bg-brand-light border-b border-orange-100 overflow-hidden">
      <div className="flex items-center h-10">
        <div className="bg-brand text-white text-xs font-bold px-4 h-full flex items-center gap-1.5 shrink-0 z-10">
          <span>🔥</span> HOT
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-8 animate-marquee whitespace-nowrap py-2.5 pl-4">
            {[...hotItems, ...hotItems].map((item, i) => (
              <a key={i} href="#" className="text-sm text-gray-600 hover:text-brand transition-colors inline-flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-brand/40" />
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event Section ───────────────────────────────────────────────

function EventSection({
  id,
  title,
  icon,
  events,
  showRanking = false,
  showViewMore = false,
}: {
  id?: string;
  title: string;
  icon?: string;
  events: EventItem[];
  showRanking?: boolean;
  showViewMore?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: dir === 'left' ? -600 : 600,
      behavior: 'smooth',
    });
  };

  return (
    <section id={id} className="py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        {showViewMore && (
          <a href="#" className="text-brand text-sm font-medium hover:underline">
            Xem thêm →
          </a>
        )}
      </div>

      <div className="relative group/section">
        {/* Left arrow — tall pill, frosted glass */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-[72px] flex items-center justify-center rounded-r-xl bg-white/60 backdrop-blur-sm text-gray-500 hover:bg-white/90 hover:text-navy transition-all duration-200 shadow-md ${canScrollLeft ? 'opacity-0 group-hover/section:opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        {/* Right arrow — tall pill, frosted glass */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-[72px] flex items-center justify-center rounded-l-xl bg-white/60 backdrop-blur-sm text-gray-500 hover:bg-white/90 hover:text-navy transition-all duration-200 shadow-md ${canScrollRight ? 'opacity-0 group-hover/section:opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>

        {/* Edge fades */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white via-white/60 to-transparent z-[5] pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white via-white/60 to-transparent z-[5] pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} rank={showRanking ? i + 1 : undefined} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Event Card (ticket-notch style) ─────────────────────────────

function EventCard({ event, rank }: { event: EventItem; rank?: number }) {
  return (
    <div className="flex-shrink-0 w-[268px] bg-white rounded-xl border border-gray-100 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,.12)] transition-all duration-300 cursor-pointer group/card overflow-hidden">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover group-hover/card:scale-[1.04] transition-transform duration-[600ms] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {rank && (
          <span className="absolute top-2.5 left-2.5 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow bg-gradient-to-br from-brand to-orange-400">
            {rank}
          </span>
        )}
        {event.badge && (
          <span className="absolute top-2.5 right-2.5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {event.badge}
          </span>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-brand/0 group-hover/card:bg-brand/5 transition-colors duration-300" />
      </div>

      {/* Ticket perforation */}
      <div className="relative h-0">
        <div className="absolute -left-2.5 -top-2.5 w-5 h-5 rounded-full bg-white" />
        <div className="absolute -right-2.5 -top-2.5 w-5 h-5 rounded-full bg-white" />
        <div className="border-t border-dashed border-gray-200 mx-4" />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-3">
        <h3 className="font-semibold text-navy text-sm leading-snug line-clamp-2 min-h-[2.5rem] mb-2 group-hover/card:text-brand transition-colors duration-200">
          {event.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-brand font-bold text-sm">{event.price}</span>
          <span className="text-gray-400 text-xs">{event.date}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Newsletter ──────────────────────────────────────────────────

function Newsletter() {
  return (
    <div className="relative mt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\'%3E%3Cpath d=\'M0 20L20 0l20 20-20 20z\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
      <div className="relative max-w-[1200px] mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Đăng ký nhận tin sự kiện</h3>
          <p className="text-gray-400 text-sm">Không bỏ lỡ deal hot & sự kiện mới mỗi tuần</p>
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Nhập email của bạn"
            className="px-5 py-3 rounded-full border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand focus:bg-white/10 w-72 md:w-80 text-sm transition-colors"
          />
          <button className="px-7 py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-dark transition-colors text-sm shadow-lg shadow-brand/20">
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-navy-dark text-gray-400 py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-xl font-bold text-white mb-3">
              <span className="text-brand">Ticket</span>Rush
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng mua vé sự kiện trực tuyến hàng đầu Việt Nam
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Danh mục</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand transition-colors">Nhạc sống</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Sân khấu</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Thể thao</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Workshop</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Chính sách hoàn tiền</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Liên hệ</h4>
            <ul className="space-y-2 text-sm">
              <li>support@ticketrush.vn</li>
              <li>Hotline: 1900 1234</li>
              <li>Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>&copy; 2026 TicketRush. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
