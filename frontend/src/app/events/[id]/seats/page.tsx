'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { connectSocket } from '@/lib/socket';
import { useCountdown } from '@/hooks/useCountdown';
import type { Seat, SeatStatusChangedPayload } from '@/types';
import {
  extractErrorMessage, groupSeatsByZone, type PendingBooking,
} from '@/lib/utils/seatUtils';
import {
  ConfirmingPanel, SeatMap, SeatsHeader, SeatsInfoBox, SeatsLoading, SelectingPanel,
} from '@/components/seats';

export default function SeatsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [promoCode, setPromoCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<PendingBooking | null>(null);

  const countdown = useCountdown(booking?.expires_at ?? null);
  const zones = useMemo(() => groupSeatsByZone(seats), [seats]);

  // Fetch seats
  useEffect(() => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Seat[] }>(`/events/${eventId}/seats`)
      .then((res) => setSeats(res.data.data ?? []))
      .catch(() => toast.error('Không thể tải sơ đồ ghế'))
      .finally(() => setLoading(false));
  }, [eventId]);

  // Socket: join event & listen for status changes
  useEffect(() => {
    const socket = connectSocket();
    socket.emit('join:event', String(eventId));

    socket.on('seat:status_changed', (changes: SeatStatusChangedPayload[]) => {
      setSeats((prev) =>
        prev.map((s) => {
          const ch = changes.find((c) => c.seat_id === s.id);
          return ch ? { ...s, status: ch.status } : s;
        }),
      );
    });

    return () => {
      socket.emit('leave:event', String(eventId));
      socket.off('seat:status_changed');
    };
  }, [eventId]);

  // Countdown expired
  useEffect(() => {
    if (countdown === 0 && booking) {
      setBooking(null);
      setSelectedIds(new Set());
      toast.error('Thời gian giữ ghế đã hết. Vui lòng chọn lại.');
    }
  }, [countdown, booking]);

  const toggleSeat = useCallback(
    (seat: Seat) => {
      if (booking || seat.status !== 'available') return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(seat.id)) next.delete(seat.id);
        else next.add(seat.id);
        return next;
      });
    },
    [booking],
  );

  const selectedSeats = seats.filter((s) => selectedIds.has(s.id));
  const bookingSeats = booking ? seats.filter((s) => booking.seat_ids.includes(s.id)) : [];
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.zone_price, 0);

  const handleBook = async () => {
    if (selectedIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ghế');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; data: PendingBooking }>('/bookings', {
        event_id: eventId,
        seat_ids: [...selectedIds],
        ...(promoCode.trim() ? { promo_code: promoCode.trim() } : {}),
      });
      setBooking(res.data.data);
      setSelectedIds(new Set());
      toast.success('Đã giữ ghế! Vui lòng xác nhận thanh toán trong 10 phút.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Không thể đặt ghế. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      await api.post(`/bookings/${booking.id}/confirm`);
      toast.success('Thanh toán thành công! Đang chuyển đến vé của bạn...');
      router.push('/tickets');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Lỗi khi xác nhận thanh toán.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      await api.post(`/bookings/${booking.id}/cancel`);
      setBooking(null);
      setSelectedIds(new Set());
      toast('Đã hủy đặt vé.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Lỗi khi hủy đặt vé.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SeatsLoading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <SeatsHeader eventId={eventId} hasBooking={!!booking} countdown={countdown} />

      <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-4 items-start">
        <SeatMap
          zones={zones}
          selectedIds={selectedIds}
          booking={booking}
          onToggleSeat={toggleSeat}
        />

        <div className="w-full lg:w-80 xl:w-96 space-y-3 lg:sticky lg:top-20">
          {booking ? (
            <ConfirmingPanel
              booking={booking}
              bookingSeats={bookingSeats}
              countdown={countdown}
              submitting={submitting}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ) : (
            <SelectingPanel
              selectedSeats={selectedSeats}
              subtotal={subtotal}
              promoCode={promoCode}
              onPromoCodeChange={setPromoCode}
              submitting={submitting}
              onBook={handleBook}
            />
          )}

          <SeatsInfoBox />
        </div>
      </div>
    </div>
  );
}
