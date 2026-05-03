'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useSWRConfig } from 'swr';
import api from '@/lib/api/client';
import { connectSocket } from '@/lib/socket';
import { useCountdown } from '@/hooks/useCountdown';
import type { Seat, SeatStatusChangedPayload } from '@/types';
import {
  extractErrorMessage,
  groupSeatsByZone,
  type PendingBooking,
} from '@/lib/utils/seatUtils';
import {
  ConfirmingPanel,
  SeatMap,
  SeatsHeader,
  SeatsInfoBox,
  SeatsLoading,
  SelectingPanel,
} from '@/components/seats';

export default function SeatsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);
  const { mutate } = useSWRConfig();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [promoCode, setPromoCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<PendingBooking | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const bookingRef = useRef<PendingBooking | null>(null);

  const countdown = useCountdown(booking?.expires_at ?? null);
  const zones = useMemo(() => groupSeatsByZone(seats), [seats]);

  useEffect(() => {
    bookingRef.current = booking;
  }, [booking]);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Seat[] }>(`/events/${eventId}/seats`)
      .then((res) => setSeats(res.data.data ?? []))
      .catch(() => toast.error('Không thể tải sơ đồ ghế'))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    const socket = connectSocket();

    const joinRoom = () => {
      setRealtimeConnected(true);
      socket.emit('join:event', String(eventId));
    };
    const markDisconnected = () => setRealtimeConnected(false);
    const handleSeatChange = (payload: SeatStatusChangedPayload[] | SeatStatusChangedPayload) => {
      const changes = Array.isArray(payload) ? payload : [payload];
      const changeMap = new Map(changes.map((change) => [change.seat_id, change.status]));

      setSeats((prev) =>
        prev.map((seat) => {
          const nextStatus = changeMap.get(seat.id);
          return nextStatus ? { ...seat, status: nextStatus } : seat;
        }),
      );

      let removedSelectedSeat = false;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        changes.forEach((change) => {
          if (change.status !== 'available' && next.delete(change.seat_id)) {
            removedSelectedSeat = true;
          }
        });
        return next;
      });

      if (removedSelectedSeat) {
        toast('Một số ghế vừa được người khác giữ hoặc mua. Danh sách chọn đã được cập nhật.');
      }

      const activeBooking = bookingRef.current;
      if (
        activeBooking &&
        changes.some((change) => activeBooking.seat_ids.includes(change.seat_id) && change.status === 'available')
      ) {
        setBooking(null);
        setSelectedIds(new Set());
        toast.error('Ghế đang giữ đã được trả lại. Vui lòng chọn lại nếu muốn đặt tiếp.');
      }
    };

    socket.on('connect', joinRoom);
    socket.on('disconnect', markDisconnected);
    socket.on('connect_error', markDisconnected);
    socket.on('seat:status_changed', handleSeatChange);

    if (socket.connected) {
      joinRoom();
    } else {
      socket.emit('join:event', String(eventId));
    }

    return () => {
      socket.emit('leave:event', String(eventId));
      socket.off('connect', joinRoom);
      socket.off('disconnect', markDisconnected);
      socket.off('connect_error', markDisconnected);
      socket.off('seat:status_changed', handleSeatChange);
    };
  }, [eventId]);

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
      toast.success('Đã giữ ghế. Vui lòng xác nhận thanh toán trong 10 phút.');
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
      // Invalidate any cached lists so my-tickets/order-history show new data instantly
      mutate((key) => typeof key === 'string' && (key.startsWith('/tickets/my') || key.startsWith('/bookings/my')));
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

      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 p-4 lg:flex-row">
        <div className="w-full lg:hidden">
          <RealtimeStatus connected={realtimeConnected} />
        </div>

        <SeatMap zones={zones} selectedIds={selectedIds} booking={booking} onToggleSeat={toggleSeat} />

        <div className="w-full space-y-3 lg:sticky lg:top-20 lg:w-80 xl:w-96">
          <div className="hidden lg:block">
            <RealtimeStatus connected={realtimeConnected} />
          </div>

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

function RealtimeStatus({ connected }: { connected: boolean }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm">
      <div className="flex items-center gap-2 text-stone-700">
        <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        {connected ? 'Realtime đang hoạt động' : 'Đang kết nối realtime...'}
      </div>
    </div>
  );
}
