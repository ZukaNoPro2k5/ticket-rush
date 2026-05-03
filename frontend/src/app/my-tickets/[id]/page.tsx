'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, CheckCircle2, Loader2, MapPin,
  QrCode, Tag, User, XCircle,
} from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import api from '@/lib/api/client';
import type { TicketDetail } from '@/types';

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT_EXPO } },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${days[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

const STATUS_MAP = {
  active:    { label: 'Còn hiệu lực', color: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 },
  used:      { label: 'Đã sử dụng',   color: 'bg-stone-100 text-stone-500',     Icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy',       color: 'bg-rose-100 text-rose-600',       Icon: XCircle },
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = Number(params?.id);

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId || isNaN(ticketId)) { router.replace('/my-tickets'); return; }

    api.get<{ success: boolean; data: TicketDetail }>(`/tickets/${ticketId}`)
      .then(({ data }) => setTicket(data.data))
      .catch(() => router.replace('/my-tickets'))
      .finally(() => setLoading(false));
  }, [ticketId, router]);

  if (loading) {
    return (
      <AccountLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      </AccountLayout>
    );
  }

  if (!ticket) return null;

  const status = STATUS_MAP[ticket.status] ?? STATUS_MAP.active;
  const StatusIcon = status.Icon;

  return (
    <AccountLayout>
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
        {/* Back */}
        <Link href="/my-tickets" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" /> Danh sách vé
        </Link>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* Main card */}
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
            {/* Event banner */}
            <div className="relative h-32 bg-gradient-to-br from-amber-400 to-orange-600 sm:h-40">
              <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=70)', backgroundSize: 'cover' }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 px-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Sự kiện</p>
                <h1 className="font-display text-lg font-bold text-white line-clamp-1 sm:text-xl">
                  {ticket.event.title}
                </h1>
              </div>
            </div>

            {/* Info grid */}
            <div className="divide-y divide-stone-100">
              <div className="grid grid-cols-2 gap-px">
                <InfoCell icon={Calendar} label="Ngày giờ" value={formatDate(ticket.event.event_date)} />
                <InfoCell icon={MapPin} label="Địa điểm" value={ticket.event.venue} />
                <InfoCell icon={Tag} label="Khu vực" value={ticket.seat.zone_name} />
                <InfoCell icon={QrCode} label="Ghế" value={`Hàng ${ticket.seat.row_label} · Số ${ticket.seat.col_number}`} />
                <InfoCell icon={User} label="Người giữ vé" value={ticket.holder.full_name} />
                <InfoCell icon={CheckCircle2} label="Trạng thái"
                  value={
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${status.color}`}>
                      <StatusIcon className="h-3 w-3" /> {status.label}
                    </span>
                  }
                />
              </div>

              {ticket.checked_in_at && (
                <div className="flex items-center gap-2 px-5 py-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Đã soát vé lúc {formatDate(ticket.checked_in_at)}
                </div>
              )}
            </div>
          </div>

          {/* QR Code card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-stone-900">Mã QR vé</h2>
            </div>

            {ticket.status === 'active' ? (
              <>
                <div className="flex justify-center rounded-xl bg-stone-50 p-4">
                  {/* QR is a base64 data URL from backend */}
                  <Image
                    src={ticket.qr_code}
                    alt="QR Code"
                    width={220}
                    height={220}
                    className="rounded-lg"
                    unoptimized
                  />
                </div>
                <p className="mt-3 text-center text-xs text-stone-400">
                  Xuất trình mã QR này tại cửa kiểm soát vé
                </p>
                {ticket.price && (
                  <div className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-center">
                    <span className="text-xs text-amber-700">Giá vé</span>
                    <p className="font-display text-lg font-bold text-amber-700">{formatVnd(ticket.price)}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-stone-50 py-12 text-stone-400">
                {ticket.status === 'used'
                  ? <><CheckCircle2 className="h-12 w-12 text-stone-300" /><p className="text-sm">Vé đã được sử dụng</p></>
                  : <><XCircle className="h-12 w-12 text-rose-300" /><p className="text-sm text-rose-400">Vé đã bị hủy</p></>
                }
              </div>
            )}

            <div className="mt-4 space-y-1.5 text-xs text-stone-400">
              <p className="flex justify-between">
                <span>Mã vé</span>
                <span className="font-mono font-semibold text-stone-700">#{String(ticket.id).padStart(6, '0')}</span>
              </p>
              <p className="flex justify-between">
                <span>Mã booking</span>
                <span className="font-mono font-semibold text-stone-700">#{String(ticket.booking_id).padStart(6, '0')}</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AccountLayout>
  );
}

function InfoCell({
  icon: Icon, label, value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-stone-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-stone-900 break-words">{value}</div>
      </div>
    </div>
  );
}
