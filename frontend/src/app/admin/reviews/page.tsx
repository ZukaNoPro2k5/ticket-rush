'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MessageSquareDot, Search, Star } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import api from '@/lib/api/client';

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminReview {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name: string;
  user_email: string;
  event_title: string;
  event_id: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

const RATING_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: '5', label: '5 ★' },
  { value: '4', label: '4 ★' },
  { value: 'low', label: '≤3 ★' },
];

function starColor(rating: number) {
  if (rating <= 2) return 'fill-rose-400 text-rose-400';
  if (rating === 3) return 'fill-amber-400 text-amber-400';
  return 'fill-emerald-400 text-emerald-400';
}

function StarRow({ rating }: { rating: number }) {
  const filled = starColor(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? filled : 'text-stone-200'}`}
        />
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminReviewsPage() {
  const [reviews, setReviews]       = useState<AdminReview[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading]       = useState(true);
  const [search,  setSearch]        = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [page,    setPage]          = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search.trim()) params.set('search', search.trim());
      if (ratingFilter !== 'all') {
        if (ratingFilter === 'low') { params.set('max_rating', '3'); }
        else { params.set('rating', ratingFilter); }
      }
      const { data } = await api.get<{ success: boolean; data: { reviews: AdminReview[]; pagination: Pagination } }>(
        `/admin/reviews?${params}`,
      );
      setReviews(data.data.reviews);
      setPagination(data.data.pagination);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search, ratingFilter]);
  useEffect(() => { void load(); }, [load]);

  return (
    <motion.div variants={staggerContainer()} initial="hidden" animate="visible" className="space-y-6">

      {/* Filters */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft space-y-3">
        <div className="flex gap-1.5">
          {RATING_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setRatingFilter(f.value)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                ratingFilter === f.value
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, tên sự kiện, nội dung đánh giá…"
            className="h-9 w-full rounded-xl border border-stone-200 pl-9 pr-3 text-sm outline-none focus:border-amber-400"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-stone-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Đang tải…</span>
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            variant="reviews"
            headline="Không tìm thấy đánh giá"
            subtext={search ? 'Thử từ khóa khác.' : 'Chưa có đánh giá nào.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  <th className="px-5 py-3 text-left">Người dùng</th>
                  <th className="px-5 py-3 text-left">Sự kiện</th>
                  <th className="px-5 py-3 text-left">Sao</th>
                  <th className="px-5 py-3 text-left">Nhận xét</th>
                  <th className="px-5 py-3 text-right">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {reviews.map(rv => (
                  <tr key={rv.id} className="transition-colors hover:bg-stone-50">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-stone-800">{rv.user_name}</p>
                      <p className="text-xs text-stone-400">{rv.user_email}</p>
                    </td>
                    <td className="max-w-[180px] px-5 py-3.5">
                      <p className="truncate font-medium text-stone-700">{rv.event_title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StarRow rating={rv.rating} />
                      <span className={`mt-0.5 block text-[11px] font-bold ${
                        rv.rating <= 2 ? 'text-rose-500' : rv.rating === 3 ? 'text-amber-700' : 'text-emerald-700'
                      }`}>{rv.rating}/5</span>
                    </td>
                    <td className="max-w-[280px] px-5 py-3.5">
                      {rv.comment ? (
                        <p className="line-clamp-2 text-sm leading-snug text-stone-600">{rv.comment}</p>
                      ) : (
                        <span className="text-xs italic text-stone-300">Không có nhận xét</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-stone-400">
                      {fmtDate(rv.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-100 px-5 py-3">
            <p className="text-xs text-stone-400">
              Trang {pagination.page}/{pagination.total_pages} · {pagination.total.toLocaleString()} đánh giá
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
