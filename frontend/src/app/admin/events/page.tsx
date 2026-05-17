'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, Clock,
  LayoutGrid, LayoutList, Loader2, Plus, Search,
  TrendingDown, TrendingUp, ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProtectedRoute } from '@/components/providers';
import { listAdminEvents } from '@/lib/api/events';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils/cn';
import { fadeUp, staggerContainer } from '@/lib/motion';
import type { AdminEvent, EventCategory, EventStatus } from '@/types';

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_CHIPS: { value: EventCategory | 'all'; label: string }[] = [
  { value: 'all',           label: 'Tất cả' },
  { value: 'music',         label: 'Âm nhạc' },
  { value: 'arts',          label: 'Nghệ thuật' },
  { value: 'sports',        label: 'Thể thao' },
  { value: 'food',          label: 'Ẩm thực' },
  { value: 'entertainment', label: 'Giải trí' },
  { value: 'workshop',      label: 'Hội thảo' },
  { value: 'stage',         label: 'Sân khấu' },
  { value: 'other',         label: 'Khác' },
];

const STATUS_OPTIONS: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'Tất cả trạng thái' },
  { value: 'published', label: 'Đang bán' },
  { value: 'draft',     label: 'Bản nháp' },
  { value: 'completed', label: 'Kết thúc' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

const STATUS_BADGE_VARIANTS: Record<EventStatus, 'active' | 'draft' | 'ended' | 'cancelled'> = {
  published: 'active',
  draft:     'draft',
  completed: 'ended',
  cancelled: 'cancelled',
};

const STATUS_LABELS: Record<EventStatus, string> = {
  published: 'Đang bán',
  draft:     'Bản nháp',
  completed: 'Kết thúc',
  cancelled: 'Đã huỷ',
};

const KPI_DEFS = [
  { key: 'total'     as const, label: 'Tổng sự kiện', iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   icon: TrendingUp },
  { key: 'published' as const, label: 'Đang bán',     iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', icon: CheckCircle2 },
  { key: 'draft'     as const, label: 'Bản nháp',     iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  icon: Clock },
  { key: 'completed' as const, label: 'Kết thúc',     iconBg: 'bg-orange-50',  iconColor: 'text-orange-600',  icon: TrendingDown },
];

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Mới nhất' },
  { value: 'oldest',   label: 'Cũ nhất' },
  { value: 'revenue',  label: 'Doanh thu cao' },
  { value: 'sold',     label: 'Bán chạy' },
  { value: 'upcoming', label: 'Sắp diễn' },
];



const PAGE_SIZE = 21;

function fmtDate(v: string) {
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(v));
}

function fmtRevenue(n: number) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'Bđ';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + 'Mđ';
  return n.toLocaleString('vi-VN') + 'đ';
}

function soldPct(ev: AdminEvent) {
  if (!ev.total_seats) return 0;
  return Math.round((ev.sold_seats / ev.total_seats) * 100);
}

function pctColor(pct: number) {
  if (pct >= 90) return 'bg-rose-500';
  if (pct >= 60) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function evtCode(id: number) {
  return 'EVT-' + String(id).padStart(3, '0');
}

// ── Table row ──────────────────────────────────────────────────────────────

function TableRow({ event, onOpen }: {
  event: AdminEvent;
  onOpen: (eventId: number) => void;
}) {
  const pct = soldPct(event);
  return (
    <motion.tr
      variants={fadeUp}
      tabIndex={0}
      onClick={() => onOpen(event.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(event.id);
      }}
      className="group cursor-pointer border-b border-stone-100 transition-colors last:border-0 hover:bg-stone-50/60 focus-visible:bg-amber-50/40 focus-visible:outline-none"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
            {event.poster_url ? (
              <Image src={event.poster_url} alt="" fill className="object-cover" sizes="64px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Calendar className="h-4 w-4 text-stone-300" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="max-w-[420px] truncate font-semibold leading-tight text-stone-900">{event.title}</p>
            <p className="mt-0.5 font-mono text-[10px] text-stone-400">{evtCode(event.id)}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="text-right text-xs font-semibold tabular-nums text-stone-700">
          <span className="text-stone-900">{event.sold_seats.toLocaleString()}</span>
          <span className="text-stone-400">/{event.total_seats.toLocaleString()}</span>
        </p>
        <div className="mt-1 h-1.5 w-20 ml-auto overflow-hidden rounded-full bg-stone-100">
          <div className={cn('h-full rounded-full transition-all', pctColor(pct))} style={{ width: pct + '%' }} />
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <span className="text-sm font-bold tabular-nums text-stone-900">
          {event.revenue > 0 ? fmtRevenue(event.revenue) : <span className="text-stone-300">—</span>}
        </span>
      </td>
      <td className="px-3 py-3">
        <Badge variant={STATUS_BADGE_VARIANTS[event.status as EventStatus]} dot size="sm">
          {STATUS_LABELS[event.status as EventStatus] ?? event.status}
        </Badge>
      </td>
    </motion.tr>
  );
}

// ── Grid card ──────────────────────────────────────────────────────────────

function GridCard({ event }: {
  event: AdminEvent;
}) {
  const pct = soldPct(event);
  return (
    <motion.div
      variants={fadeUp}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <Link href={`/admin/events/${event.id}`} className="flex h-full flex-col">
        <div className="relative h-44 bg-stone-100">
          {event.poster_url ? (
            <Image src={event.poster_url} alt={event.title} fill className="object-cover" sizes="(max-width:768px)100vw,33vw" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Calendar className="h-10 w-10 text-stone-200" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute left-3 top-3">
            <Badge variant={STATUS_BADGE_VARIANTS[event.status as EventStatus]} dot size="sm">
              {STATUS_LABELS[event.status as EventStatus] ?? event.status}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div>
            <h3 className="line-clamp-2 font-semibold leading-snug text-stone-900">{event.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {fmtDate(event.event_date)}
              </span>
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Vé đã bán</span>
              <span className={cn('font-bold tabular-nums', pct >= 90 ? 'text-rose-500' : pct >= 60 ? 'text-amber-500' : 'text-emerald-600')}>
                {pct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
              <div className={cn('h-full rounded-full', pctColor(pct))} style={{ width: pct + '%' }} />
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between pt-1">
            <span className="text-base font-bold tabular-nums text-stone-900">
              {event.revenue > 0 ? fmtRevenue(event.revenue) : <span className="text-sm text-stone-400">—</span>}
            </span>
            <span className="text-xs font-semibold text-amber-700">Xem trước</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPageChange }: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const start = Math.max(1, page - 1);
    const end   = Math.min(totalPages, page + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 text-stone-500 transition-colors disabled:opacity-40 hover:border-stone-300"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            'grid h-8 w-8 place-items-center rounded-lg border text-xs font-semibold transition-colors',
            p === page
              ? 'border-amber-500 bg-amber-500 text-white'
              : 'border-stone-200 text-stone-600 hover:border-stone-300',
          )}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 text-stone-500 transition-colors disabled:opacity-40 hover:border-stone-300"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminEventsPage() {
  const router = useRouter();
  const [events,     setEvents]     = useState<AdminEvent[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [category,   setCategory]   = useState<EventCategory | 'all'>('all');
  const [status,     setStatus]     = useState<EventStatus | 'all'>('all');
  const [search,     setSearch]     = useState('');
  const [sort,       setSort]       = useState('newest');
  const [view,       setView]       = useState<'table' | 'grid'>('table');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  const sortedEvents = useMemo(() => {
    const arr = [...events];
    if (sort === 'oldest')   return arr.sort((a, b) => a.id - b.id);
    if (sort === 'revenue')  return arr.sort((a, b) => b.revenue - a.revenue);
    if (sort === 'sold')     return arr.sort((a, b) => b.sold_seats - a.sold_seats);
    if (sort === 'upcoming') return arr.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    return arr.sort((a, b) => b.id - a.id); // newest
  }, [events, sort]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAdminEvents({
        status:   status   !== 'all' ? status   : undefined,
        category: category !== 'all' ? category : undefined,
        search:   search.trim() || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setEvents(result.events);
      setTotalPages(result.pagination.total_pages);
      setTotal(result.pagination.total);
    } catch {
      setEvents([]);
      toast.error('Không thể tải danh sách sự kiện.');
    } finally {
      setLoading(false);
    }
  }, [status, category, search, page]);

  useEffect(() => { void loadEvents(); }, [loadEvents]);
  useEffect(() => { setPage(1); }, [status, category, search]);

  const kpiStats = useMemo(() => ({
    total,
    published: events.filter(e => e.status === 'published').length,
    draft:     events.filter(e => e.status === 'draft').length,
    completed: events.filter(e => e.status === 'completed').length,
  }), [events, total]);

  return (
    <ProtectedRoute requireAdmin>
      <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-5">

        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Sự kiện</h1>
            <p className="mt-1 text-sm text-stone-500">Theo dõi, xem trước và chỉnh sửa các sự kiện đang vận hành.</p>
          </div>
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Plus className="h-4 w-4" /> Tạo sự kiện
          </Link>
        </motion.div>

        {/* KPI tiles */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPI_DEFS.map(({ key, label, iconBg, iconColor, icon: Icon }) => (
            <div
              key={key}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3.5 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">{label}</p>
                <span className={`inline-flex rounded-xl p-2 ${iconBg}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-stone-900">
                {loading
                  ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-stone-100" />
                  : kpiStats[key]}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Filter bar */}
        <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map(chip => (
              <button
                key={chip.value}
                onClick={() => setCategory(chip.value)}
                className={cn(
                  'rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors',
                  category === chip.value
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-300',
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm sự kiện..."
                className="h-10 w-56 rounded-xl border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-amber-400"
              />
            </div>

            {/* Status dropdown */}
            <div className="relative">
              <select
                value={status}
                onChange={e => setStatus(e.target.value as EventStatus | 'all')}
                className="h-10 appearance-none rounded-xl border border-stone-200 bg-white pl-3 pr-9 text-sm text-stone-700 outline-none focus:border-amber-400"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400" />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-stone-200 bg-white pl-9 pr-9 text-sm text-stone-700 outline-none focus:border-amber-400"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400" />
            </div>

            {/* View toggle */}
            <div className="ml-auto flex overflow-hidden rounded-xl border border-stone-200 bg-white">
              <button
                onClick={() => setView('table')}
                className={cn(
                  'flex h-10 items-center gap-1 px-3 text-xs font-semibold transition-colors',
                  view === 'table' ? 'bg-amber-500 text-white' : 'text-stone-500 hover:bg-stone-50',
                )}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'flex h-10 items-center gap-1 px-3 text-xs font-semibold transition-colors',
                  view === 'grid' ? 'bg-amber-500 text-white' : 'text-stone-500 hover:bg-stone-50',
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white py-16 text-stone-400 shadow-soft"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Đang tải…</span>
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState
                variant="events"
                headline="Không có sự kiện phù hợp bộ lọc"
                subtext="Thử thay đổi bộ lọc hoặc tạo sự kiện mới."
                className="rounded-2xl border border-stone-200 bg-white shadow-soft"
                action={
                  <Link href="/admin/events/new" className="text-xs font-semibold text-amber-600 hover:underline">
                    Tạo sự kiện mới
                  </Link>
                }
              />
            </motion.div>
          ) : view === 'table' ? (
            <motion.div
              key="table"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      <th className="px-4 py-3 text-left">Sự kiện</th>
                      <th className="px-3 py-3 text-right">Vé bán</th>
                      <th className="px-3 py-3 text-right">Doanh thu</th>
                      <th className="px-3 py-3 text-left">Trạng thái</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={staggerContainer()}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-stone-100"
                  >
                    {sortedEvents.map(ev => (
                      <TableRow key={ev.id} event={ev} onOpen={(id) => router.push(`/admin/events/${id}`)} />
                    ))}
                  </motion.tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
                  <p className="text-xs text-stone-400">
                    Hiển thị {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} / {total} sự kiện
                  </p>
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <motion.div
                variants={staggerContainer()}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {sortedEvents.map(ev => (
                  <GridCard key={ev.id} event={ev} />
                ))}
              </motion.div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-3 shadow-soft">
                  <p className="text-xs text-stone-400">
                    Hiển thị {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} / {total} sự kiện
                  </p>
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </ProtectedRoute>
  );
}
