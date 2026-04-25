'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy, Check, Clock, Tag, Flame, Sparkles, Crown, Zap, ArrowRight, TicketPercent,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PROMOTIONS, type Promotion } from '@/data/promotions';
import { fadeUp, staggerContainer, cardVariant, useSectionInView } from '@/lib/motion';
import { formatVnd } from '@/data/uiConfig';

const FILTERS = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'new-user', label: 'Người mới' },
  { key: 'concert',  label: 'Concert' },
  { key: 'sport',    label: 'Thể thao' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'theatre',  label: 'Kịch & nghệ thuật' },
] as const;

type FilterKey = typeof FILTERS[number]['key'];

function useCountdown(iso: string) {
  const target = new Date(iso).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return { expired: true, label: 'Đã hết hạn' };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days >= 2) return { expired: false, label: `Còn ${days} ngày` };
  if (days === 1) return { expired: false, label: `Còn 1 ngày ${hours}h` };
  return { expired: false, label: `Còn ${hours}h — sắp hết!`, urgent: true };
}

function TagPill({ tag }: { tag?: Promotion['tag'] }) {
  if (!tag) return null;
  const map = {
    hot:   { bg: 'bg-rose-500',    Icon: Flame,    label: 'HOT' },
    new:   { bg: 'bg-emerald-600', Icon: Sparkles, label: 'NGƯỜI MỚI' },
    flash: { bg: 'bg-orange-600',  Icon: Zap,      label: 'FLASH' },
    vip:   { bg: 'bg-purple-600',  Icon: Crown,    label: 'VIP' },
  } as const;
  const { bg, Icon, label } = map[tag];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${bg}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function VoucherCard({ p }: { p: Promotion }) {
  const [copied, setCopied] = useState(false);
  const countdown = useCountdown(p.expiresAt);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.code);
      setCopied(true);
      toast.success(`Đã sao chép: ${p.code}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không sao chép được. Hãy copy thủ công.');
    }
  };

  const valueLabel =
    p.type === 'percent'   ? `${p.value}%` :
    p.type === 'cashback'  ? `HOÀN ${p.value}%` :
    p.type === 'shipping'  ? 'FREE SHIP' :
    formatVnd(p.value);

  return (
    <motion.article
      variants={cardVariant}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      className="group relative flex overflow-hidden rounded-2xl bg-white shadow-soft transition-shadow hover:shadow-lift"
    >
      {/* Left value block */}
      <div className={`relative flex w-28 flex-shrink-0 flex-col items-center justify-center ${p.sponsorColor ?? 'bg-amber-500'} p-3 text-white sm:w-32`}>
        <TicketPercent className="absolute right-2 top-2 h-4 w-4 opacity-30" />
        <span className="font-display text-2xl font-extrabold leading-none sm:text-3xl">{valueLabel}</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-90">
          {p.type === 'cashback' ? 'hoàn tiền' : 'giảm ngay'}
        </span>
        {/* Punch holes */}
        <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-stone-50" />
        <span className="absolute -right-2 top-1/4 h-4 w-4 -translate-y-1/2 rounded-full bg-stone-50 opacity-0" />
      </div>

      {/* Right content */}
      <div className="relative flex min-w-0 flex-1 flex-col justify-between p-4 pl-5">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <TagPill tag={p.tag} />
            {p.sponsor && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                {p.sponsor}
              </span>
            )}
          </div>
          <h3 className="truncate font-display text-base font-bold text-stone-900">{p.title}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{p.subtitle}</p>

          {p.minSpend && (
            <p className="mt-2 text-[11px] text-stone-500">
              Đơn tối thiểu <span className="font-semibold text-stone-700">{formatVnd(p.minSpend)}</span>
            </p>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[11px] font-medium">
              <Clock className={`h-3 w-3 ${countdown.urgent ? 'text-rose-500' : 'text-stone-400'}`} />
              <span className={countdown.urgent ? 'font-semibold text-rose-600' : 'text-stone-500'}>
                {countdown.label}
              </span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-stone-200">
              <div
                className={`h-full rounded-full ${p.usedPercent > 80 ? 'bg-rose-500' : p.usedPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${p.usedPercent}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-stone-400">Đã dùng {p.usedPercent}%</p>
          </div>

          <button
            onClick={copy}
            aria-label={`Sao chép mã ${p.code}`}
            className={`inline-flex items-center gap-1 rounded-lg border-2 border-dashed px-3 py-2 text-xs font-bold transition-colors
              ${copied
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white'}`}
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> Đã copy</> : <><Copy className="h-3.5 w-3.5" /> {p.code}</>}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function PromotionsPage() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [pendingQuery, setPendingQuery] = useState('');

  const { ref, inView } = useSectionInView();

  const list = useMemo(() => {
    return PROMOTIONS.filter((p) => {
      if (filter !== 'all' && p.category !== filter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filter, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(pendingQuery);
  };

  return (
    <>
      <Navbar variant="solid" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-900 bg-mesh-warm py-14 lg:py-20">
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Sparkles className="h-3.5 w-3.5" /> Ưu đãi mới nhất
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
              Săn mã giảm giá — <span className="text-amber-400">tiết kiệm tới 50%</span>
            </h1>
            <p className="mt-3 max-w-xl text-base text-stone-300 md:text-lg">
              Kho ưu đãi cập nhật hàng ngày. Chọn mã, sao chép và nhập khi thanh toán để giảm ngay.
            </p>

            <form onSubmit={handleSearch} className="mt-6 flex max-w-md gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={pendingQuery}
                  onChange={(e) => setPendingQuery(e.target.value)}
                  placeholder="Tìm theo mã hoặc tiêu đề…"
                  className="h-12 w-full rounded-full border border-white/10 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-stone-400 backdrop-blur focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>
              <button type="submit" className="h-12 rounded-full bg-amber-500 px-5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift">
                Tìm
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-20 border-b border-stone-200 bg-stone-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 lg:px-8">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors
                  ${active ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 hover:bg-stone-100'}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Voucher grid */}
      <section ref={ref} className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-stone-900 md:text-3xl">
              {list.length} ưu đãi đang hoạt động
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Nhấp vào mã để sao chép, sau đó dán khi thanh toán.
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <TicketPercent className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-3 font-semibold text-stone-700">Không tìm thấy ưu đãi phù hợp</p>
            <p className="mt-1 text-sm text-stone-500">Thử bỏ bớt bộ lọc hoặc quay lại sau nhé.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={staggerContainer(0.06)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {list.map((p) => <VoucherCard key={p.id} p={p} />)}
          </motion.div>
        )}

        {/* How it works */}
        <div className="mt-14 rounded-3xl border border-stone-200 bg-white p-6 md:p-8">
          <h3 className="font-display text-lg font-bold text-stone-900 md:text-xl">Cách sử dụng mã ưu đãi</h3>
          <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { n: 1, t: 'Sao chép mã', d: 'Nhấp nút mã ở thẻ ưu đãi bạn thích.' },
              { n: 2, t: 'Chọn vé', d: 'Vào sự kiện và chọn vé như bình thường.' },
              { n: 3, t: 'Dán khi thanh toán', d: 'Nhập mã ở ô "Mã ưu đãi" để được giảm ngay.' },
            ].map((s) => (
              <li key={s.n} className="flex items-start gap-3">
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-amber-500 font-display text-base font-bold text-white">{s.n}</span>
                <div>
                  <p className="font-semibold text-stone-900">{s.t}</p>
                  <p className="text-sm text-stone-500">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <a href="/events" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800">
            Khám phá sự kiện ngay <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
