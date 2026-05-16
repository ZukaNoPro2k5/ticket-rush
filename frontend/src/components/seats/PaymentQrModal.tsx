'use client';

import { X } from 'lucide-react';
import type { Seat } from '@/types';
import { formatMmSs, formatVnd, type PendingBooking } from '@/lib/utils/seatUtils';
import { PaymentQrMock } from './PaymentQrMock';

interface Props {
  open: boolean;
  booking: PendingBooking | null;
  bookingSeats: Seat[];
  countdown: number;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PaymentQrModal({
  open,
  booking,
  bookingSeats,
  countdown,
  submitting,
  onClose,
  onConfirm,
  onCancel,
}: Props) {
  if (!open || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-950">Thanh toán đơn đặt vé</h2>
            <p className="mt-0.5 text-sm text-stone-500">Quét QR demo hoặc xác nhận thanh toán để tạo vé.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng QR thanh toán"
            className="grid h-9 w-9 place-items-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
          <PaymentQrMock booking={booking} />

          <aside className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-stone-400">Thời gian giữ ghế</p>
              <p className={`mt-1 font-mono text-3xl font-bold tabular-nums ${countdown < 120 ? 'text-red-500' : 'text-orange-500'}`}>
                {formatMmSs(countdown)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-stone-800">Ghế đã giữ</p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {bookingSeats.map((seat) => (
                  <div key={seat.id} className="flex items-center justify-between gap-3 text-xs text-stone-600">
                    <span className="min-w-0 truncate">
                      {seat.zone_name} - {seat.row_label}
                      {seat.col_number}
                    </span>
                    <span className="shrink-0 tabular-nums">{formatVnd(seat.zone_price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-200 pt-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-stone-500">Tổng cộng</span>
                <span className="font-display text-lg font-bold tabular-nums text-orange-600">
                  {formatVnd(booking.total_amount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={submitting}
                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:bg-stone-200 disabled:text-stone-400"
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Hủy đặt vé
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
