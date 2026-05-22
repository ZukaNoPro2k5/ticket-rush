'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy, Check, Clock, Tag, Flame, Sparkles, Zap, ArrowRight, TicketPercent,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { listPublicPromoCodes } from '@/lib/api/promoCodes';
import { fadeUp, staggerContainer, cardVariant, useSectionInView } from '@/lib/motion';
import type { EventCategory, PublicPromoCode } from '@/types';
import { useLocale } from '@/components/providers/LocaleProvider';

const FILTERS = [
  { key: 'all' },
  { key: 'global' },
  { key: 'music' },
  { key: 'arts' },
  { key: 'sports' },
  { key: 'food' },
  { key: 'entertainment' },
  { key: 'workshop' },
  { key: 'stage' },
  { key: 'other' },
] as const;

type FilterKey = typeof FILTERS[number]['key'];
type PromoTag = 'hot' | 'new' | 'flash';

interface PromotionView {
  id: number;
  title: string;
  subtitle: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  category: FilterKey | EventCategory;
  minSpend: number;
  expiresAt: string;
  usedPercent: number;
  tag?: PromoTag;
  sponsor: string;
  sponsorColor: string;
}

const CATEGORY_COLORS: Partial<Record<EventCategory, string>> = {
  music: 'bg-rose-500',
  arts: 'bg-sky-600',
  sports: 'bg-emerald-600',
  workshop: 'bg-amber-600',
  stage: 'bg-orange-600',
  food: 'bg-teal-600',
  entertainment: 'bg-purple-600',
  other: 'bg-stone-600',
};

function toPromotionView(
  p: PublicPromoCode,
  copy: ReturnType<typeof useLocale>['messages']['promotions'],
  formatCurrency: (value: number) => string,
): PromotionView {
  const usedPercent = p.max_uses
    ? Math.min(100, Math.round((p.used_count / p.max_uses) * 100))
    : 0;
  const scoped = Boolean(p.event_id && p.event_title);
  const discountText = p.discount_type === 'percent'
    ? `${copy.discount} ${p.discount_value}%`
    : `${copy.discount} ${formatCurrency(p.discount_value)}`;

  return {
    id: p.id,
    title: scoped ? `${copy.scopedTitle} ${p.event_title}` : copy.globalTitle,
    subtitle: scoped
      ? `${discountText} ${copy.scopedSubtitle}`
      : `${discountText} ${copy.globalSubtitle}`,
    code: p.code,
    type: p.discount_type,
    value: p.discount_value,
    category: p.event_category ?? 'global',
    minSpend: p.min_amount,
    expiresAt: p.expires_at,
    usedPercent,
    tag: usedPercent >= 80 ? 'flash' : scoped ? 'hot' : 'new',
    sponsor: scoped ? p.event_title! : 'TicketRush',
    sponsorColor: p.event_category ? (CATEGORY_COLORS[p.event_category] ?? 'bg-amber-500') : 'bg-amber-500',
  };
}

function useCountdown(iso: string, copy: ReturnType<typeof useLocale>['messages']['promotions']) {
  const target = new Date(iso).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return { expired: true, label: copy.expired };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days >= 2) return { expired: false, label: copy.remainingDays(days) };
  if (days === 1) return { expired: false, label: copy.remainingDayHours(hours) };
  return { expired: false, label: copy.remainingHours(hours), urgent: true };
}

function TagPill({ tag }: { tag?: PromoTag }) {
  const { messages } = useLocale();
  if (!tag) return null;
  const map = {
    hot:   { bg: 'bg-rose-500',    Icon: Flame,    label: 'HOT' },
    new:   { bg: 'bg-emerald-600', Icon: Sparkles, label: messages.promotions.newcomer },
    flash: { bg: 'bg-orange-600',  Icon: Zap,      label: 'FLASH' },
  } as const;
  const { bg, Icon, label } = map[tag];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${bg}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function VoucherCard({ p }: { p: PromotionView }) {
  const { formatCurrency, messages } = useLocale();
  const [copied, setCopied] = useState(false);
  const countdown = useCountdown(p.expiresAt, messages.promotions);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.code);
      setCopied(true);
      toast.success(`${messages.promotions.copied}: ${p.code}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(messages.promotions.copyFailed);
    }
  };

  const valueLabel = p.type === 'percent' ? `${p.value}%` : formatCurrency(p.value);

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
          {messages.promotions.saveNow}
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

          {p.minSpend > 0 && (
            <p className="mt-2 text-[11px] text-stone-500">
              {messages.promotions.minOrder} <span className="font-semibold text-stone-700">{formatCurrency(p.minSpend)}</span>
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
            <p className="mt-0.5 text-[10px] text-stone-400">{messages.promotions.used} {p.usedPercent}%</p>
          </div>

          <button
            onClick={copy}
            aria-label={`${messages.promotions.copyCode} ${p.code}`}
            className={`inline-flex items-center gap-1 rounded-lg border-2 border-dashed px-3 py-2 text-xs font-bold transition-colors
              ${copied
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white'}`}
          >
            {copied ? <><Check className="h-3.5 w-3.5" /> {messages.promotions.copiedShort}</> : <><Copy className="h-3.5 w-3.5" /> {p.code}</>}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function PromotionsPage() {
  const { formatCurrency, messages } = useLocale();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');
  const [pendingQuery, setPendingQuery] = useState('');
  const [promos, setPromos] = useState<PromotionView[]>([]);
  const [loading, setLoading] = useState(true);

  const { ref, inView } = useSectionInView();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listPublicPromoCodes()
      .then((rows) => {
        if (alive) setPromos(rows.map((row) => toPromotionView(row, messages.promotions, formatCurrency)));
      })
      .catch(() => {
        if (alive) setPromos([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [formatCurrency, messages.promotions]);

  const list = useMemo(() => {
    return promos.filter((p) => {
      if (filter !== 'all' && p.category !== filter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return p.title.toLowerCase().includes(q)
          || p.code.toLowerCase().includes(q)
          || p.sponsor.toLowerCase().includes(q);
      }
      return true;
    });
  }, [filter, promos, query]);

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
              <Sparkles className="h-3.5 w-3.5" /> {messages.promotions.latest}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">
              {messages.promotions.heroLead} - <span className="text-amber-400">{messages.promotions.heroAccent}</span>
            </h1>
            <p className="mt-3 max-w-xl text-base text-stone-300 md:text-lg">
              {messages.promotions.heroIntro}
            </p>

            <form onSubmit={handleSearch} className="mt-6 flex max-w-md gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={pendingQuery}
                  onChange={(e) => setPendingQuery(e.target.value)}
                  placeholder={messages.promotions.searchPlaceholder}
                  className="h-12 w-full rounded-full border border-white/10 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-stone-400 backdrop-blur focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                />
              </div>
              <button type="submit" className="h-12 rounded-full bg-amber-500 px-5 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-lift">
                {messages.promotions.search}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="sticky top-16 z-20 border-b border-stone-200 bg-stone-50/90 backdrop-blur lg:top-20">
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
                {f.key === 'all'
                  ? messages.promotions.all
                  : f.key === 'global'
                    ? messages.promotions.global
                    : messages.categories[f.key]}
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
              {messages.promotions.activeCount(list.length)}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {messages.promotions.pasteHint}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-white shadow-soft" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <TicketPercent className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-3 font-semibold text-stone-700">{messages.promotions.empty}</p>
            <p className="mt-1 text-sm text-stone-500">{messages.promotions.emptyHint}</p>
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
          <h3 className="font-display text-lg font-bold text-stone-900 md:text-xl">{messages.promotions.howTo}</h3>
          <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { n: 1, t: messages.promotions.howCopy, d: messages.promotions.howCopyDesc },
              { n: 2, t: messages.promotions.howSelect, d: messages.promotions.howSelectDesc },
              { n: 3, t: messages.promotions.howPaste, d: messages.promotions.howPasteDesc },
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
            {messages.promotions.explore} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
