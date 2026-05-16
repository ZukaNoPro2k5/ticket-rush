'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import api from '@/lib/api/client';
import type { ApiResponse, PaginatedResponse, TicketListItem, TicketStatus } from '@/types';
import { AccountCard, AccountEmptyState, AccountLayout } from '@/components/account/AccountLayout';

const statusStyle: Record<TicketStatus, { label: string; className: string }> = {
  active: { label: 'Còn hiệu lực', className: 'bg-emerald-100 text-emerald-700' },
  used: { label: 'Đã sử dụng', className: 'bg-stone-100 text-stone-600' },
  cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-700' },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function MyTicketsPage() {
  const [items, setItems] = useState<TicketListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get<ApiResponse<PaginatedResponse<TicketListItem>>>(`/tickets/my?status=valid&page=${page}&limit=10`)
      .then((res) => {
        if (!mounted) return;
        setItems(res.data.data?.items ?? []);
        setTotalPages(Math.max(1, res.data.data?.pagination.total_pages ?? 1));
      })
      .catch(() => toast.error('Không thể tải danh sách vé'))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <AccountLayout
      title="Vé của tôi"
      description="Theo dõi các vé đã thanh toán và trạng thái check-in."
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
          title="Bạn chưa có vé nào"
          description="Sau khi thanh toán thành công, vé sẽ xuất hiện tại đây."
        />
      ) : (
        <div className="space-y-3">
          {items.map((ticket) => {
            const status = statusStyle[ticket.status];
            return (
              <AccountCard key={ticket.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <Ticket className="h-3.5 w-3.5" /> #{ticket.id}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <Link
                      href={`/events/${ticket.event.id}`}
                      className="font-display text-lg font-bold text-stone-950 hover:text-amber-700"
                    >
                      {ticket.event.title}
                    </Link>
                    <div className="mt-2 grid gap-1 text-sm text-stone-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" /> {formatDate(ticket.event.event_date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {ticket.event.venue}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700 md:min-w-[180px]">
                    <p className="text-xs uppercase tracking-wider text-stone-400">Ghế</p>
                    <p className="mt-1 font-semibold">
                      {ticket.seat.zone_name} - {ticket.seat.row_label}
                      {ticket.seat.col_number}
                    </p>
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
