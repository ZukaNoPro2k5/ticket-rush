'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  PencilLine,
  Ticket,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '@/components/ui/Badge';
import { changeEventStatus, getEventById } from '@/lib/api/events';
import { fadeUp } from '@/lib/motion';
import type { EventDetail, EventStatus } from '@/types';

const STATUS_BADGE_VARIANTS: Record<EventStatus, 'active' | 'draft' | 'ended' | 'cancelled'> = {
  published: 'active',
  draft: 'draft',
  completed: 'ended',
  cancelled: 'cancelled',
};

const STATUS_LABELS: Record<EventStatus, string> = {
  published: 'Đang bán',
  draft: 'Bản nháp',
  completed: 'Kết thúc',
  cancelled: 'Đã huỷ',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return value.toLocaleString('vi-VN') + 'đ';
}

export default function AdminEventPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const eventId = Number(id);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getEventById(eventId);
      setEvent(next);
    } catch {
      toast.error('Không tải được sự kiện');
      router.replace('/admin/events');
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    if (!eventId) {
      router.replace('/admin/events');
      return;
    }
    void load();
  }, [eventId, load, router]);

  const totals = useMemo(() => {
    const totalSeats = event?.seat_zones.reduce((sum, zone) => sum + (zone.total_seats ?? 0), 0) ?? 0;
    const availableSeats = event?.seat_zones.reduce((sum, zone) => sum + (zone.available_seats ?? 0), 0) ?? 0;
    const soldSeats = Math.max(0, totalSeats - availableSeats);
    return { totalSeats, availableSeats, soldSeats };
  }, [event]);

  async function updateStatus(next: Exclude<EventStatus, 'draft'>) {
    if (!event) return;
    setSaving(true);
    try {
      const updated = await changeEventStatus(event.id, next);
      setEvent((prev) => prev ? { ...prev, ...updated } : prev);
      toast.success(`Đã chuyển trạng thái: ${STATUS_LABELS[next]}`);
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-stone-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Đang tải bản xem trước…</span>
      </div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
          <ArrowLeft className="h-4 w-4" />
          Danh sách sự kiện
        </Link>
        <Link
          href={`/admin/events/${event.id}/edit`}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          <PencilLine className="h-4 w-4" />
          Chỉnh sửa sự kiện & vé
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="relative min-h-[220px] bg-stone-100">
            {event.poster_url ? (
              <Image src={event.poster_url} alt={event.title} fill className="object-cover" sizes="280px" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <CalendarDays className="h-10 w-10 text-stone-300" />
              </div>
            )}
          </div>

          <div className="space-y-5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge variant={STATUS_BADGE_VARIANTS[event.status]} dot size="sm">
                  {STATUS_LABELS[event.status]}
                </Badge>
                <h1 className="mt-3 font-display text-2xl font-bold text-stone-900">{event.title}</h1>
              </div>
              <Link
                href={`/events/${event.id}`}
                target="_blank"
                className="rounded-xl border border-stone-200 px-3.5 py-2 text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900"
              >
                Mở trang khách
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(event.event_date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Tổng vé" value={totals.totalSeats.toLocaleString('vi-VN')} />
              <Metric label="Đã bán" value={totals.soldSeats.toLocaleString('vi-VN')} />
              <Metric
                label="Giá vé"
                value={event.min_price != null ? formatMoney(event.min_price) : 'Chưa đặt'}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-stone-900">Thiết lập trạng thái</h2>
          <p className="text-sm text-stone-500">Các hành động vận hành nằm ở đây thay vì rải trên bảng danh sách.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === 'draft' && (
            <button
              onClick={() => void updateStatus('published')}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mở bán
            </button>
          )}
          {event.status === 'published' && (
            <button
              onClick={() => void updateStatus('completed')}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 disabled:opacity-50"
            >
              <Clock className="h-4 w-4" />
              Kết thúc sự kiện
            </button>
          )}
          {(event.status === 'draft' || event.status === 'published') && (
            <button
              onClick={() => void updateStatus('cancelled')}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Huỷ sự kiện
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-stone-900">Khu vé</h2>
          <p className="text-sm text-stone-500">Tổng quan nhanh trước khi đi vào chỉnh sửa chi tiết.</p>
        </div>
        <div className="divide-y divide-stone-100">
          {event.seat_zones.map((zone) => (
            <div key={zone.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Ticket className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{zone.name}</p>
                  <p className="text-xs text-stone-500">{formatMoney(zone.price)}</p>
                </div>
              </div>
              <p className="text-sm font-semibold tabular-nums text-stone-700">
                {(zone.available_seats ?? 0).toLocaleString('vi-VN')}/{(zone.total_seats ?? 0).toLocaleString('vi-VN')} còn
              </p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-stone-50 px-4 py-3">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-stone-900">{value}</p>
    </div>
  );
}
