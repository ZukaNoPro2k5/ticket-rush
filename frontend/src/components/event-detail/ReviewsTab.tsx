'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Loader2, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api/client';
import { ReviewCardSkeleton } from '@/components/ui/Skeleton';

interface Review {
  id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  full_name: string;
}

interface ReviewsData {
  reviews: Review[];
  total: number;
  avg_rating: number | null;
}

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  const active = hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${n} sao`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              n <= active
                ? 'fill-amber-500 text-amber-500'
                : 'fill-none text-stone-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function RatingSummary({ data }: { data: ReviewsData }) {
  if (data.total === 0) return null;

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data.reviews.filter((r) => r.rating === star).length,
    pct: data.total > 0
      ? Math.round((data.reviews.filter((r) => r.rating === star).length / data.total) * 100)
      : 0,
  }));

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="font-display text-5xl font-bold text-amber-700">
            {data.avg_rating?.toFixed(1) ?? '–'}
          </div>
          <div className="mt-1.5 flex justify-center">
            <StarRating value={Math.round(data.avg_rating ?? 0)} size="sm" />
          </div>
          <div className="mt-1 text-xs text-stone-500">{data.total} đánh giá</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-3 text-stone-500">{star}</span>
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-stone-400">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.full_name?.charAt(0)?.toUpperCase() ?? '?';
  const date = new Date(review.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 font-bold text-amber-700">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{review.full_name}</p>
          <p className="text-xs text-stone-400">{date}</p>
        </div>
        <div className="ml-auto">
          <StarRating value={review.rating} size="sm" />
        </div>
      </div>
      {review.comment && (
        <p className="mt-3 text-sm leading-relaxed text-stone-700">{review.comment}</p>
      )}
    </div>
  );
}

function ReviewForm({
  eventId,
  onSubmitted,
}: {
  eventId: number;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Vui lòng chọn số sao'); return; }
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/events/${eventId}/reviews`, { rating, comment: comment.trim() || undefined });
      onSubmitted();
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      setError(
        code === 'EVENT_NOT_COMPLETED' ? 'Sự kiện chưa kết thúc, chưa thể đánh giá'
          : code === 'NO_TICKET' ? 'Bạn cần có vé hợp lệ để đánh giá'
          : code === 'ALREADY_REVIEWED' ? 'Bạn đã đánh giá sự kiện này rồi'
          : 'Gửi đánh giá thất bại, thử lại sau',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
      <h3 className="mb-4 font-semibold text-stone-800">Viết đánh giá của bạn</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <p className="mb-2 text-xs font-medium text-stone-600">Xếp hạng</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sự kiện này…"
          rows={3}
          className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          maxLength={500}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
}

export function ReviewsTab({ eventId }: { eventId: number }) {
  const { isAuthenticated } = useAuthStore();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    api.get<{ success: boolean; data: ReviewsData }>(`/events/${eventId}/reviews`)
      .then(({ data: res }) => setData(res.data))
      .catch(() => setData({ reviews: [], total: 0, avg_rating: null }))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return (
    <div className="space-y-4">
      {/* Rating summary */}
      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex gap-6">
            <div className="animate-pulse space-y-2">
              <div className="h-12 w-12 rounded-xl bg-stone-200" />
              <div className="h-3 w-20 rounded bg-stone-200" />
            </div>
            <div className="flex-1 space-y-2 pt-1">
              {[80, 50, 30, 15, 5].map((w) => (
                <div key={w} className="flex items-center gap-3">
                  <div className="h-3 w-3 animate-pulse rounded bg-stone-200" />
                  <div className="h-1.5 flex-1 animate-pulse rounded-full bg-stone-200" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : data && <RatingSummary data={data} />}

      {/* Review form (only when logged in) */}
      {isAuthenticated && (
        <ReviewForm eventId={eventId} onSubmitted={fetchReviews} />
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <ReviewCardSkeleton key={i} />)}
        </div>
      ) : data?.reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white py-14 text-stone-400">
          <MessageSquare className="h-10 w-10 text-stone-200" strokeWidth={1.5} />
          <p className="text-sm">Chưa có đánh giá nào</p>
          {!isAuthenticated && (
            <p className="text-xs">Đăng nhập để là người đầu tiên đánh giá</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}

