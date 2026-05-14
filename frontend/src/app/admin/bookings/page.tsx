'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Loader2, Search } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import api from '@/lib/api/client';

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminBooking {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  confirmed_at: string | null;
  user_name: string;
  user_email: string;
  event_title: string;
  event_date: string;
  ticket_count: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: 'all',       label: 'Tất cả' },
  { value: 'pending',   label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã huỷ' },
  { value: 'expired',   label: 'Hết hạn' },
];

const STATUS_BADGE_VARIANTS: Record<string, 'pending' | 'active' | 'cancelled' | 'expired'> = {
  pending:   'pending',
  confirmed: 'active',
  cancelled: 'cancelled',
  expired:   'expired',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',      expired: 'Hết hạn',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'tr';
  return n.toLocaleString('vi-VN') + 'đ';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('all');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (tab !== 'all') params.set('status', tab);
      if (search.trim()) params.set('search', search.trim());
      const { data } = await api.get<{ success: boolean; data: { bookings: AdminBooking[]; pagination: Pagination } }>(
        `/admin/bookings?${params}`,
      );
      setBookings(data.data.bookings);
      setPagination(data.data.pagination);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [tab, search, page]);

  useEffect(() => { setPage(1); }, [tab, search]);
  useEffect(() => { void load(); }, [load]);

  return (
    <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-6">

      {/* Filters */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft space-y-3">
        <div className="flex overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 px-3 py-2 text-xs font-semibold transition-colors ${
                tab === t.value
                  ? 'bg-white text-stone-900 shadow-sm z-10 rounded-xl'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, tên sự kiện…"
            className="h-9 w-full rounded-xl border border-stone-200 pl-9 pr-3 text-sm outline-none focus:border-amber-400"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-2 py-16 text-stone-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Đang tải…</span>
            </motion.div>
          ) : bookings.length === 0 ? (
            <motion.div
              key={`empty-${tab}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <EmptyState
                variant="bookings"
                headline="Chưa có đơn đặt vé"
                subtext={tab !== 'all' ? 'Thử chọn trạng thái khác.' : 'Đơn đặt vé sẽ xuất hiện tại đây.'}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`data-${tab}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-x-auto"
            >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-5 py-3 text-left">Khách hàng</th>
                  <th className="px-5 py-3 text-left">Sự kiện</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Vé</th>
                  <th className="px-5 py-3 text-right">Tổng tiền</th>
                  <th className="px-5 py-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map(bk => (
                  <tr key={bk.id} className="transition-colors hover:bg-stone-50">
                    <td className="px-5 py-3.5 font-mono text-xs text-stone-400">#{bk.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                          {bk.user_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{bk.user_name}</p>
                          <p className="text-xs text-stone-400">{bk.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[200px] px-5 py-3.5">
                      <p className="truncate font-medium text-stone-700">{bk.event_title}</p>
                      <p className="text-xs text-stone-400">{fmtDate(bk.event_date)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={STATUS_BADGE_VARIANTS[bk.status] ?? 'default'} dot size="sm">
                        {STATUS_LABELS[bk.status] ?? bk.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-stone-700">
                      {bk.ticket_count}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold tabular-nums text-stone-900">
                      {fmtCurrency(bk.total_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="text-xs text-stone-500">{fmtDate(bk.created_at)}</div>
                      {bk.confirmed_at && (
                        <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-600">
                          <Clock className="h-3 w-3" /> {fmtTime(bk.confirmed_at)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
            <p className="text-xs text-stone-400">
              Trang {pagination.page}/{pagination.total_pages} · {pagination.total.toLocaleString()} đơn
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 disabled:opacity-40 hover:border-stone-300"
              >
                Trước
              </button>
              <button
                disabled={page >= pagination.total_pages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 disabled:opacity-40 hover:border-stone-300"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
