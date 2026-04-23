'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, Tag, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { connectSocket } from '@/lib/socket';
import { useCountdown } from '@/hooks/useCountdown';
import type { Seat, SeatStatusChangedPayload } from '@/types';

// ---- Local types ----
interface PendingBooking {
  id: number;
  seat_ids: number[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  promo_code: string | null;
  expires_at: string;
}

// ---- Zone grouping ----
interface ZoneData {
  id: number;
  name: string;
  color: string;
  price: number;
  rows: Map<string, Seat[]>;
}

function groupSeatsByZone(seats: Seat[]): ZoneData[] {
  const map = new Map<number, ZoneData>();

  for (const seat of seats) {
    if (!map.has(seat.zone_id)) {
      map.set(seat.zone_id, {
        id: seat.zone_id,
        name: seat.zone_name,
        color: seat.zone_color,
        price: seat.zone_price,
        rows: new Map(),
      });
    }
    const zone = map.get(seat.zone_id)!;
    if (!zone.rows.has(seat.row_label)) {
      zone.rows.set(seat.row_label, []);
    }
    zone.rows.get(seat.row_label)!.push(seat);
  }

  for (const zone of map.values()) {
    zone.rows = new Map([...zone.rows.entries()].sort());
    for (const row of zone.rows.values()) {
      row.sort((a: Seat, b: Seat) => a.col_number - b.col_number);
    }
  }

  return [...map.values()];
}

// ---- Seat background color ----
function getSeatBg(
  seat: Seat,
  selectedIds: Set<number>,
  booking: PendingBooking | null,
): string {
  if (seat.status === 'sold') return '#374151';
  if (seat.status === 'locked') {
    if (booking?.seat_ids.includes(seat.id)) return '#ff6b35'; // my locked seat
    return '#9ca3af';
  }
  // available
  return selectedIds.has(seat.id) ? '#ff6b35' : seat.zone_color;
}

// ---- Time formatting ----
function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ===========================================================
// Main Page Component
// ===========================================================
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

  // ---- Fetch seats ----
  useEffect(() => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Seat[] }>(`/events/${eventId}/seats`)
      .then((res) => setSeats(res.data.data ?? []))
      .catch(() => toast.error('Không thể tải sơ đồ ghế'))
      .finally(() => setLoading(false));
  }, [eventId]);

  // ---- Socket: join event room & listen ----
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

  // ---- Countdown expired ----
  useEffect(() => {
    if (countdown === 0 && booking) {
      setBooking(null);
      setSelectedIds(new Set());
      toast.error('Thời gian giữ ghế đã hết. Vui lòng chọn lại.');
    }
  }, [countdown, booking]);

  // ---- Seat selection ----
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

  // ---- API actions ----
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response
        ?.data?.error?.message;
      toast.error(msg ?? 'Không thể đặt ghế. Vui lòng thử lại.');
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response
        ?.data?.error?.message;
      toast.error(msg ?? 'Lỗi khi xác nhận thanh toán.');
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
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response
        ?.data?.error?.message;
      toast.error(msg ?? 'Lỗi khi hủy đặt vé.');
    } finally {
      setSubmitting(false);
    }
  };

  // ===========================================================
  // RENDER
  // ===========================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={`/events/${eventId}`}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-gray-800">Chọn ghế ngồi</span>

          {booking && (
            <span
              className={`ml-auto text-sm font-mono font-bold ${
                countdown < 120 ? 'text-red-500' : 'text-orange-500'
              }`}
            >
              ⏱ {formatMmSs(countdown)}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-4 items-start">
        {/* ── Left: Seat Map ── */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden min-w-0">
          {/* Stage */}
          <div className="flex justify-center pt-5 pb-3 px-6 bg-gradient-to-b from-gray-100 to-white">
            <div className="bg-gray-800 text-white text-[11px] font-bold tracking-[0.25em] px-12 py-2 rounded-b-3xl shadow">
              SÂN KHẤU
            </div>
          </div>

          {/* Zone legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center px-6 py-3 bg-gray-50 border-y">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span
                  className="w-3.5 h-3.5 rounded-sm inline-block shrink-0"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="font-medium">{zone.name}</span>
                <span className="text-gray-400">{zone.price.toLocaleString('vi-VN')}đ</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-3.5 h-3.5 rounded-sm inline-block shrink-0 bg-orange-500" />
              <span>Đã chọn / Của bạn</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-3.5 h-3.5 rounded-sm inline-block shrink-0 bg-gray-400" />
              <span>Đang giữ</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="w-3.5 h-3.5 rounded-sm inline-block shrink-0 bg-gray-700" />
              <span>Đã bán</span>
            </div>
          </div>

          {/* Seat grids */}
          <div className="divide-y px-4 pb-8">
            {zones.map((zone) => (
              <div key={zone.id} className="py-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: zone.color }}
                  />
                  {zone.name}
                  <span className="text-gray-400 font-normal text-xs">
                    — {zone.price.toLocaleString('vi-VN')}đ / ghế
                  </span>
                </h3>

                <div className="overflow-x-auto pb-1">
                  <div className="inline-block">
                    {[...zone.rows.entries()].map(([rowLabel, rowSeats]) => (
                      <div key={rowLabel} className="flex items-center gap-1 mb-1">
                        {/* Row label */}
                        <span className="w-5 shrink-0 text-center text-[10px] text-gray-400 font-medium">
                          {rowLabel}
                        </span>

                        {/* Seats */}
                        {rowSeats.map((seat: Seat) => {
                          const bg = getSeatBg(seat, selectedIds, booking);
                          const isClickable = seat.status === 'available' && !booking;
                          const isMyBookedSeat = booking?.seat_ids.includes(seat.id) ?? false;
                          const isSelected = selectedIds.has(seat.id);

                          return (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeat(seat)}
                              disabled={!isClickable}
                              title={`${seat.zone_name} — Hàng ${seat.row_label}, Ghế ${seat.col_number}\n${seat.zone_price.toLocaleString('vi-VN')}đ\n${
                                seat.status === 'available'
                                  ? 'Còn trống'
                                  : seat.status === 'locked'
                                    ? isMyBookedSeat
                                      ? 'Ghế của bạn'
                                      : 'Đang giữ'
                                    : 'Đã bán'
                              }`}
                              style={{
                                backgroundColor: bg,
                                cursor: isClickable ? 'pointer' : 'default',
                                outline:
                                  isSelected || isMyBookedSeat
                                    ? '2px solid #ff6b35'
                                    : '1px solid rgba(0,0,0,0.1)',
                                outlineOffset: isSelected || isMyBookedSeat ? '1px' : '0',
                              }}
                              className="w-7 h-7 rounded-sm text-[9px] text-white font-bold transition-transform enabled:hover:scale-110 enabled:active:scale-95 shrink-0"
                            >
                              {seat.col_number}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {zones.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-12">
                Sự kiện này chưa có thông tin ghế.
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="w-full lg:w-80 xl:w-96 space-y-3 lg:sticky lg:top-20">
          {booking ? (
            /* ── CONFIRMING phase ── */
            <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
              {/* Countdown */}
              <div className="text-center py-2">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">
                  Thời gian giữ ghế còn lại
                </p>
                <p
                  className={`text-5xl font-mono font-bold tabular-nums ${
                    countdown < 120 ? 'text-red-500' : 'text-orange-500'
                  }`}
                >
                  {formatMmSs(countdown)}
                </p>
                {countdown < 120 && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    ⚠ Sắp hết hạn! Xác nhận ngay.
                  </p>
                )}
              </div>

              {/* Booked seats */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Ghế đã giữ</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {bookingSeats.map((seat) => (
                    <div key={seat.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: seat.zone_color }}
                        />
                        {seat.zone_name} — {seat.row_label}
                        {seat.col_number}
                      </span>
                      <span className="font-medium text-gray-800 shrink-0">
                        {seat.zone_price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-t pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tạm tính ({bookingSeats.length} ghế)</span>
                  <span>{booking.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {booking.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      Giảm giá{booking.promo_code ? ` (${booking.promo_code})` : ''}
                    </span>
                    <span>−{booking.discount_amount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1">
                  <span className="text-gray-800">Tổng cộng</span>
                  <span className="text-orange-600">
                    {booking.total_amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Confirm */}
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>

              {/* Cancel */}
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                Hủy đặt vé
              </button>
            </div>
          ) : (
            /* ── SELECTING phase ── */
            <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
              <h2 className="font-semibold text-gray-800">Ghế đã chọn</h2>

              {selectedSeats.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Nhấn vào ghế trên sơ đồ để chọn
                </p>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: seat.zone_color }}
                        />
                        {seat.zone_name} — {seat.row_label}
                        {seat.col_number}
                      </span>
                      <span className="font-medium text-gray-800 shrink-0">
                        {seat.zone_price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedSeats.length > 0 && (
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span className="text-gray-700">
                    Tạm tính ({selectedIds.size} ghế)
                  </span>
                  <span className="text-orange-600">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              {/* Promo code input */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Mã giảm giá (tùy chọn)
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 uppercase tracking-wider placeholder:uppercase placeholder:tracking-normal placeholder:text-gray-300"
                />
              </div>

              {/* Book button */}
              <button
                onClick={handleBook}
                disabled={submitting || selectedIds.size === 0}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {submitting
                  ? 'Đang xử lý...'
                  : selectedIds.size > 0
                    ? `Đặt ${selectedIds.size} ghế`
                    : 'Chọn ghế để tiếp tục'}
              </button>

              {selectedIds.size > 0 && (
                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  Ghế sẽ được giữ 10 phút sau khi đặt
                </p>
              )}
            </div>
          )}

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
            <p className="font-semibold mb-1">Lưu ý quan trọng</p>
            <p>• Ghế giữ tối đa 10 phút — xác nhận thanh toán ngay</p>
            <p>• Nếu hết hạn, ghế sẽ tự động trả lại</p>
            <p>• Mỗi lần đặt có thể chọn nhiều ghế</p>
          </div>
        </div>
      </div>
    </div>
  );
}
