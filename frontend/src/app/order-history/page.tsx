'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, ReceiptText } from 'lucide-react';
import api from '@/lib/api/client';
import type { ApiResponse, BookingListItem, BookingStatus, PaginatedResponse } from '@/types';
import { AccountCard, AccountEmptyState, AccountLayout } from '@/components/account/AccountLayout';
import { formatVnd } from '@/lib/utils/seatUtils';

const statusStyle: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'Đang chờ thanh toán', className: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
};

function formatDate(value: string | null) {
  if (!value) return 'Chưa xác nhận';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function OrderHistoryPage() {
  const [items, setItems] = useState<BookingListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get<ApiResponse<PaginatedResponse<BookingListItem>>>(`/bookings/my?page=${page}&limit=10`)
      .then((res) => {
        if (!mounted) return;
        setItems(res.data.data?.items ?? []);
        setTotalPages(Math.max(1, res.data.data?.pagination.total_pages ?? 1));
      })
      .catch(() => toast.error('Không thể tải lịch sử đặt vé'))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <AccountLayout
      title="Lịch sử đặt vé"
      description="Xem lại các đơn giữ ghế, thanh toán và hủy đặt vé của bạn."
    >
      {loading ? (
        <AccountCard>
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-stone-100" />
            <div className="h-24 animate-pulse rounded-xl bg-stone-100" />
          </div>
        </AccountCard>
      ) : items.length === 0 ? (
        <AccountEmptyState
          title="Chưa có lịch sử đặt vé"
          description="Các đơn đặt vé sẽ được lưu tại đây để bạn dễ theo dõi."
        />
      ) : (
        <div className="space-y-3">
          {items.map((booking) => {
            const status = statusStyle[booking.status];
            return (
              <AccountCard key={booking.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                        <ReceiptText className="h-3.5 w-3.5" /> Đơn #{booking.id}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <Link
                      href={`/events/${booking.event.id}`}
                      className="font-display text-lg font-bold text-stone-950 hover:text-amber-700"
                    >
                      {booking.event.title}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> Sự kiện: {formatDate(booking.event.event_date)}
                      </span>
                      <span>{booking.seat_count} ghế</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-stone-50 px-4 py-3 text-right md:min-w-[180px]">
                    <p className="text-xs uppercase tracking-wider text-stone-400">Tổng tiền</p>
                    <p className="mt-1 font-display text-lg font-bold tabular-nums text-amber-700">
                      {formatVnd(booking.total_amount)}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">Xác nhận: {formatDate(booking.confirmed_at)}</p>
                  </div>
                </div>
              </AccountCard>
            );
          })}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                Trước
              </button>
              <span className="rounded-full bg-white px-4 py-2 text-sm text-stone-500">
                {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      )}
    </AccountLayout>
  );
}
