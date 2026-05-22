'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Flame, MapPin, TrendingUp } from 'lucide-react';
import type { DisplayEvent } from '@/types';
import { cardVariant, fadeUp, staggerContainer, useSectionInView } from '@/lib/motion';
import EmptyState from '@/components/ui/EmptyState';
import { useLocale } from '@/components/providers/LocaleProvider';

interface RankStyle {
  num: string;
  ring: string;
}

function getRankStyle(rank: number): RankStyle {
  if (rank === 1) return { num: 'text-amber-500',  ring: 'ring-amber-200 bg-amber-50' };
  if (rank === 2) return { num: 'text-stone-400',  ring: 'ring-stone-200 bg-stone-50' };
  if (rank === 3) return { num: 'text-orange-600', ring: 'ring-orange-200 bg-orange-50' };
  return { num: 'text-stone-400', ring: 'ring-transparent bg-transparent' };
}

function getSellThroughGradient(soldPercent: number): string {
  if (soldPercent > 80) return 'from-rose-400 to-orange-500';
  if (soldPercent > 50) return 'from-amber-400 to-orange-400';
  return 'from-amber-300 to-amber-500';
}

function SectionHeader() {
  const { messages } = useLocale();

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700">
          <Flame className="h-3.5 w-3.5" /> {messages.home.ranking}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>
      <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">{messages.home.mostWanted}</h2>
      <p className="mt-1 text-sm text-stone-500 md:text-base">{messages.home.rankingDesc}</p>
    </div>
  );
}

function RankBadge({ rank, change }: { rank: number; change: number }) {
  const style = getRankStyle(rank);
  return (
    <div className="flex items-center gap-2">
      <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ring-1 ${style.ring}`}>
        <span className={`font-display text-lg font-black leading-none tabular-nums ${style.num}`}>
          {rank}
        </span>
      </div>
      {change !== 0 && (
        <span className={`hidden text-[10px] font-bold tabular-nums md:flex md:flex-col md:items-center md:leading-none ${change > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
          <span>{change > 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(change)}</span>
        </span>
      )}
    </div>
  );
}

function LeaderboardRow({ ev, rank }: { ev: DisplayEvent; rank: number }) {
  const change = ev.rankChange ?? 0;
  const soldPercent = Math.min(ev.soldPercent, 100);
  const sellThroughGradient = getSellThroughGradient(soldPercent);
  const { messages, formatCurrency } = useLocale();

  return (
    <motion.div variants={cardVariant}>
      <Link
        href={`/events/${ev.id}`}
        className="group relative grid items-center gap-3 border-b border-stone-100 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-amber-50/50 md:grid-cols-[56px_1fr_160px_200px_130px] md:gap-4 md:px-6"
      >
        <span className="absolute inset-y-0 left-0 w-[3px] origin-center scale-y-0 rounded-r-full bg-amber-400 transition-transform duration-200 group-hover:scale-y-100" />

        <RankBadge rank={rank} change={change} />

        {/* Event info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200 md:h-[58px] md:w-[58px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ev.poster} alt={ev.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-1 font-semibold text-stone-900 transition-colors group-hover:text-amber-700">{ev.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                <MapPin className="h-3 w-3 flex-shrink-0" /> {ev.city}
              </span>
              {ev.badge === 'hot' && (
                <span className="rounded-full bg-rose-50 px-1.5 py-px text-[10px] font-bold text-rose-600 ring-1 ring-rose-200">HOT</span>
              )}
              {ev.badge === 'almost-sold' && (
                <span className="rounded-full bg-orange-50 px-1.5 py-px text-[10px] font-bold text-orange-600 ring-1 ring-orange-200">SẮP CHÁY</span>
              )}
            </div>
            {/* Mobile meta */}
            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-stone-500 md:hidden">
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{ev.dateLabel}</span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600">
                <TrendingUp className="h-3 w-3" />{soldPercent}% {messages.common.sold.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Date/Time — desktop */}
        <div className="hidden md:block">
          <div className="text-sm font-medium text-stone-800">{ev.dateLabel}</div>
          <div className="mt-0.5 text-xs text-stone-500">{ev.timeLabel} · {ev.city}</div>
        </div>

        {/* Velocity — desktop */}
        <div className="hidden md:block">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" /> {soldPercent}%
            </span>
            <span className="text-[11px] text-stone-400">{messages.common.sold.toLowerCase()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${sellThroughGradient}`}
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </div>

        {/* Price — desktop */}
        <div className="flex flex-col items-end gap-1">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400">{messages.common.from}</div>
            <div className="font-display text-base font-bold text-amber-700">{formatCurrency(ev.priceFrom)}</div>
          </div>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
            {messages.common.details}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export function TrendingLeaderboard({ events, loading = false }: { events?: DisplayEvent[]; loading?: boolean }) {
  const { ref, inView } = useSectionInView(0.1);
  const { messages } = useLocale();
  const data = [...(events ?? [])]
    .sort((a, b) => b.soldPercent - a.soldPercent)
    .slice(0, 10);
  const columnHeaders = [
    messages.home.rank,
    messages.common.event,
    messages.home.time,
    messages.home.sellThrough,
    messages.common.from,
  ];

  return (
    <section className="bg-stone-50 py-12 lg:py-16">
      <div ref={ref} className="mx-auto max-w-7xl px-4 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-6 flex flex-wrap items-end justify-between gap-3"
        >
          <SectionHeader />
          <Link href="/events?sort=trending" className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800">
            {messages.home.rankingFull} <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="h-72 animate-pulse rounded-3xl border border-stone-200 bg-white shadow-soft" />
        ) : data.length === 0 ? (
          <EmptyState
            variant="events"
            headline={messages.home.noRanking}
            subtext={messages.home.noRankingDesc}
            className="rounded-3xl border border-stone-200 bg-white shadow-soft"
          />
        ) : (
        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft"
        >
          {/* Desktop column headers */}
          <div className="hidden border-b border-stone-100 bg-stone-50/70 px-6 py-3 md:grid md:grid-cols-[56px_1fr_160px_200px_130px] md:gap-4">
            {columnHeaders.map((h, i) => (
              <span key={h} className={`text-[11px] font-bold uppercase tracking-wider text-stone-400 ${i === 4 ? 'text-right' : ''}`}>
                {h}
              </span>
            ))}
          </div>

          {data.map((ev, i) => (
            <LeaderboardRow key={ev.id} ev={ev} rank={i + 1} />
          ))}
        </motion.div>
        )}
      </div>
    </section>
  );
}
