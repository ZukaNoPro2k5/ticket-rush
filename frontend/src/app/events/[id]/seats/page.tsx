'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api/client';
import { connectSocket } from '@/lib/socket';
import { useCountdown } from '@/hooks/useCountdown';
import type { BookingRules, EventDetail, Seat, SeatStatusChangedPayload } from '@/types';
import {
  extractErrorMessage,
  groupSeatsByZone,
  type PendingBooking,
} from '@/lib/utils/seatUtils';
import {
  SeatMap,
  SeatsInfoBox,
  SeatsLoading,
  SelectingPanel,
  TicketTypePicker,
} from '@/components/seats';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/stores/authStore';
import type { BookingDetail } from '@/types';

export default function SeatsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [booking, setBooking] = useState<PendingBooking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingRules, setBookingRules] = useState<BookingRules | null>(null);
  const [entryExpiresAt, setEntryExpiresAt] = useState<string | null>(null);
  const bookingRef = useRef<PendingBooking | null>(null);
  const layoutRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const zoneOrder = useMemo(() => event?.seat_zones.map((zone) => zone.id) ?? [], [event]);
  const zones = useMemo(() => groupSeatsByZone(seats, zoneOrder), [seats, zoneOrder]);
  const countdown = useCountdown(booking?.expires_at ?? null);
  const entryCountdown = useCountdown(entryExpiresAt);
  const toPendingBooking = useCallback((detail: {
    id: number;
    seats: { id: number }[];
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    promo_code: string | null;
    expires_at: string;
  }): PendingBooking => ({
    id: detail.id,
    seat_ids: detail.seats.map((seat) => seat.id),
    subtotal: detail.subtotal,
    discount_amount: detail.discount_amount,
    total_amount: detail.total_amount,
    promo_code: detail.promo_code,
    expires_at: detail.expires_at,
  }), []);

  useEffect(() => {
    bookingRef.current = booking;
  }, [booking]);

  const refreshSeatLayout = useCallback(async () => {
    const [seatsRes, eventRes] = await Promise.all([
      api.get<{ success: boolean; data: Seat[] }>(`/events/${eventId}/seats`),
      api.get<{ success: boolean; data: EventDetail }>(`/events/${eventId}`),
    ]);
    setSeats(seatsRes.data.data ?? []);
    setEvent(eventRes.data.data);
  }, [eventId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      refreshSeatLayout(),
      api.get<{ success: boolean; data: BookingRules }>('/bookings/rules'),
    ])
      .then(([, rulesRes]) => {
        setBookingRules(rulesRes.data.data);
        setEntryExpiresAt(new Date(Date.now() + rulesRes.data.data.ticket_hold_minutes * 60_000).toISOString());
      })
      .catch(() => toast.error('Không thể tải sơ đồ ghế'))
      .finally(() => setLoading(false));
  }, [refreshSeatLayout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    api.get<{ success: boolean; data: BookingDetail | null }>('/bookings/pending', {
      params: { event_id: eventId },
    })
      .then((res) => {
        const pending = res.data.data;
        if (!pending) return;
        const restored = toPendingBooking(pending);
        setBooking(restored);
        setSelectedIds(new Set(restored.seat_ids));
      })
      .catch(() => {});
  }, [eventId, isAuthenticated, toPendingBooking]);

  useEffect(() => {
    const socket = connectSocket();

    const joinRoom = () => socket.emit('join:event', String(eventId));
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
          const isMyHeldSeat = bookingRef.current?.seat_ids.includes(change.seat_id) ?? false;
          if (change.status !== 'available' && !isMyHeldSeat && next.delete(change.seat_id)) {
            removedSelectedSeat = true;
          }
        });
        return next;
      });

      if (removedSelectedSeat) {
        toast('Một số ghế vừa được người khác giữ hoặc mua. Danh sách chọn đã được cập nhật.');
      }

    };
    const handleLayoutChange = () => {
      if (layoutRefreshTimerRef.current) clearTimeout(layoutRefreshTimerRef.current);
      layoutRefreshTimerRef.current = setTimeout(() => {
        refreshSeatLayout()
          .then(() => toast('Sơ đồ ghế vừa được cập nhật.'))
          .catch(() => toast.error('Không thể tải bản cập nhật sơ đồ ghế.'));
      }, 180);
    };

    socket.on('connect', joinRoom);
    socket.on('seat:status_changed', handleSeatChange);
    socket.on('seat:layout_changed', handleLayoutChange);

    if (socket.connected) {
      joinRoom();
    } else {
      socket.emit('join:event', String(eventId));
    }

    return () => {
      socket.emit('leave:event', String(eventId));
      socket.off('connect', joinRoom);
      socket.off('seat:status_changed', handleSeatChange);
      socket.off('seat:layout_changed', handleLayoutChange);
      if (layoutRefreshTimerRef.current) clearTimeout(layoutRefreshTimerRef.current);
    };
  }, [eventId, refreshSeatLayout]);

  useEffect(() => {
    const handleFocus = () => {
      refreshSeatLayout().catch(() => {});
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshSeatLayout]);

  useEffect(() => {
    const bookingExpired = booking ? new Date(booking.expires_at).getTime() <= Date.now() : false;
    if (booking && countdown === 0 && bookingExpired) {
      const expiredSeatIds = new Set(booking.seat_ids);
      setBooking(null);
      setSelectedIds(new Set());
      setSeats((prev) => prev.map((seat) => (
        expiredSeatIds.has(seat.id) ? { ...seat, status: 'available' } : seat
      )));
      if (bookingRules) {
        setEntryExpiresAt(new Date(Date.now() + bookingRules.ticket_hold_minutes * 60_000).toISOString());
      }
      toast.error('Thời gian giữ ghế đã hết. Vui lòng chọn lại.');
    }
  }, [booking, bookingRules, countdown]);

  const toggleSeat = useCallback(
    async (seat: Seat) => {
      if (submitting) return;
      const currentBooking = bookingRef.current;
      const isHeldByMe = currentBooking?.seat_ids.includes(seat.id) ?? false;
      if (seat.status !== 'available' && !isHeldByMe) return;

      const maxTickets = bookingRules?.max_tickets_per_booking ?? 10;
      const nextIds = new Set(currentBooking?.seat_ids ?? []);
      if (isHeldByMe) nextIds.delete(seat.id);
      else {
        if (nextIds.size >= maxTickets) {
          toast.error(`Tối đa ${maxTickets} vé cho mỗi giao dịch`);
          return;
        }
        nextIds.add(seat.id);
      }

      setSubmitting(true);
      try {
        if (!currentBooking) {
          const res = await api.post<{ success: boolean; data: PendingBooking }>('/bookings', {
            event_id: eventId,
            seat_ids: [seat.id],
          });
          const nextBooking = res.data.data;
          setBooking(nextBooking);
          setSelectedIds(new Set(nextBooking.seat_ids));
          setSeats((prev) => prev.map((item) => item.id === seat.id ? { ...item, status: 'locked' } : item));
          return;
        }

        if (nextIds.size === 0) {
          await api.post(`/bookings/${currentBooking.id}/cancel`);
          setBooking(null);
          setSelectedIds(new Set());
          setSeats((prev) => prev.map((item) => item.id === seat.id ? { ...item, status: 'available' } : item));
          return;
        }

        const res = await api.put<{
          success: boolean;
          data: {
            id: number;
            seats: { id: number }[];
            subtotal: number;
            discount_amount: number;
            total_amount: number;
            promo_code: string | null;
            expires_at: string;
          };
        }>(`/bookings/${currentBooking.id}/seats`, {
          seat_ids: [...nextIds],
        });
        const nextBooking = toPendingBooking(res.data.data);
        setBooking(nextBooking);
        setSelectedIds(new Set(nextBooking.seat_ids));
        setSeats((prev) => prev.map((item) => {
          if (item.id === seat.id) return { ...item, status: isHeldByMe ? 'available' : 'locked' };
          return item;
        }));
      } catch (err) {
        const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
        if (code === 'QUEUE_REQUIRED') {
          toast('Sự kiện đang mở phòng chờ. Mình chuyển bạn vào hàng đợi nhé.');
          router.push(`/events/${eventId}/queue`);
          return;
        }
        toast.error(extractErrorMessage(err, 'Không thể cập nhật ghế. Vui lòng thử lại.'));
      } finally {
        setSubmitting(false);
      }
    },
    [bookingRules, eventId, router, submitting, toPendingBooking],
  );

  const selectedSeats = seats.filter((s) => selectedIds.has(s.id));
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.zone_price, 0);
  const unitLabel = event?.seating_mode === 'seated' ? 'ghế' : 'vé';
  const nonSeatedMode = event?.seating_mode === 'zoned' ? 'zoned' : 'admission';

  const handleBook = async () => {
    if (event?.seating_mode === 'seated') {
      if (!booking) {
        toast.error('Vui lòng chọn ít nhất 1 ghế');
        return;
      }
      router.push(`/checkout/${booking.id}`);
      return;
    }

    if (selectedIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ghế');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; data: { id: number } }>('/bookings', {
        event_id: eventId,
        seat_ids: [...selectedIds],
      });
      setSelectedIds(new Set());
      toast.success('Đã giữ chỗ. Đang chuyển sang thanh toán...');
      router.push(`/checkout/${res.data.data.id}`);
    } catch (err) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (code === 'QUEUE_REQUIRED') {
        toast('Sự kiện đang mở phòng chờ. Mình chuyển bạn vào hàng đợi nhé.');
        router.push(`/events/${eventId}/queue`);
        return;
      }
      toast.error(extractErrorMessage(err, 'Không thể đặt ghế. Vui lòng thử lại.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SeatsLoading />;
  if (!event) {
    return (
      <div className="grid min-h-screen place-items-center bg-stone-50 px-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-stone-900">Không tải được thông tin sự kiện</p>
          <p className="mt-1 text-sm text-stone-500">Vui lòng quay lại và thử lần nữa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="solid" />

      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 p-4 lg:flex-row">
        {event?.seating_mode === 'seated' ? (
          <SeatMap
            zones={zones}
            layoutConfig={event.layout_config}
            selectedIds={selectedIds}
            booking={booking}
            onToggleSeat={toggleSeat}
          />
        ) : (
          <TicketTypePicker
            zones={zones}
            selectedIds={selectedIds}
            booking={null}
            onChange={setSelectedIds}
            mode={nonSeatedMode}
            maxTickets={bookingRules?.max_tickets_per_booking ?? 10}
          />
        )}

        <div className="w-full space-y-3 lg:sticky lg:top-24 lg:w-80 xl:w-96">
          <SelectingPanel
            selectedSeats={selectedSeats}
            subtotal={subtotal}
            eventTitle={event.title}
            venue={event.venue}
            eventDate={event.event_date}
            countdown={booking ? countdown : entryCountdown}
            submitting={submitting}
            onContinue={handleBook}
            unitLabel={unitLabel}
          />
          <SeatsInfoBox
            holdMinutes={bookingRules?.ticket_hold_minutes ?? 10}
            maxTickets={bookingRules?.max_tickets_per_booking ?? 10}
          />
        </div>
      </div>
    </div>
  );
}
