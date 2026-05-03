'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Ticket, MapPin, Calendar, CheckCircle2, XCircle, Clock, QrCode } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { TicketRowSkeleton } from '@/components/ui/Skeleton';
import { fadeUp } from '@/lib/motion';

interface MyTicket {
  id: number;
  event: { id: number; title: string; venue: string; event_date: string };
  seat: { zone_name: string; row_label: string; col_number: number };
  status: 'valid' | 'used' | 'cancelled';
  checked_in_at: string | null;
  created_at: string;
}

const STATUS_TABS = [
  { key: '',          label: 'Tất cả' },
  { key: 'valid',     label: 'Còn hiệu lực' },
  { key: 'used',      label: 'Đã dùng' },
  { key: 'cancelled', label: 'Đã hủy' },
];

function StatusBadge({ status }: { status: MyTicket['status'] }) {
  if (status === 'valid')
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Còn hiệu lực
      </span>
    );
  if (status === 'used')
    return (
      <span className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
        <Clock className="h-3 w-3" /> Đã sử dụng
      </span>
    );
  return (
    <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-600">
      <XCircle className="h-3 w-3" /> Đã hủy
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MyTicketsPage() {
  const [status, setStatus] = useState('');

  const params = new URLSearchParams({ limit: '20' });
  if (status) params.set('status', status);
  const { data, isLoading } = useSWR<{ items: MyTicket[]; pagination: { total: number } }>(
    `/tickets/my?${params.toString()}`,
  );
  const tickets = data?.items ?? [];
  const total = data?.pagination.total ?? 0;
  const loading = isLoading && !data;

  return (
    <AccountLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Vé của tôi</h1>
          <p className="mt-1 text-sm text-stone-500">
            {total > 0 ? `${total} vé` : 'Chưa có vé nào'}
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1
                ${status === tab.key
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <TicketRowSkeleton key={i} />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200 bg-white py-20 text-center shadow-soft">
            <Ticket className="h-12 w-12 text-stone-200" />
            <div>
              <p className="font-semibold text-stone-700">Chưa có vé nào</p>
              <p className="mt-1 text-sm text-stone-400">Hãy đặt vé sự kiện yêu thích của bạn</p>
            </div>
            <Link href="/events" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
              Khám phá sự kiện
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-shadow hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusBadge status={ticket.status} />
                    <span className="text-xs text-stone-400">#{ticket.id}</span>
                  </div>
                  <Link
                    href={`/events/${ticket.event.id}`}
                    className="block truncate font-semibold text-stone-900 hover:text-amber-600 transition-colors"
                  >
                    {ticket.event.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {ticket.event.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatDate(ticket.event.event_date)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-stone-600">
                    Ghế: {ticket.seat.zone_name} — {ticket.seat.row_label}{ticket.seat.col_number}
                  </p>
                </div>
                <div className="shrink-0">
                  <Link
                    href={`/my-tickets/${ticket.id}`}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    <QrCode className="h-3.5 w-3.5" /> Xem vé
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AccountLayout>
  );
}
