'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import type { Seat } from '@/types';
import { formatMmSs, formatVnd, type PendingBooking } from '@/lib/utils/seatUtils';
import { PaymentQrMock } from './PaymentQrMock';

interface Props {
  booking: PendingBooking;
  bookingSeats: Seat[];
  countdown: number;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmingPanel({
  booking,
  bookingSeats,
  countdown,
  submitting,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <div className="py-2 text-center">
        <p className="mb-1 text-xs uppercase tracking-wider text-gray-400">Thời gian giữ ghế còn lại</p>
        <p className={`font-mono text-5xl font-bold tabular-nums ${countdown < 120 ? 'text-red-500' : 'text-orange-500'}`}>
          {formatMmSs(countdown)}
        </p>
        {countdown < 120 && <p className="mt-1 text-xs font-medium text-red-500">Sắp hết hạn. Xác nhận ngay.</p>}
      </div>

      <div className="border-t pt-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">Ghế đã giữ</p>
        <div className="max-h-48 space-y-1.5 overflow-y-auto">
          {bookingSeats.map((seat) => (
            <div key={seat.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 flex items-center gap-1.5 text-gray-600">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seat.zone_color }} />
                <span className="truncate">
                  {seat.zone_name} - {seat.row_label}
                  {seat.col_number}
                </span>
              </span>
              <span className="min-w-[96px] shrink-0 whitespace-nowrap text-right font-medium tabular-nums text-gray-800">
                {formatVnd(seat.zone_price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 border-t pt-3">
        <div className="flex justify-between gap-4 text-sm text-gray-500">
          <span>Tạm tính ({bookingSeats.length} ghế)</span>
          <span className="min-w-[120px] whitespace-nowrap text-right tabular-nums">{formatVnd(booking.subtotal)}</span>
        </div>
        {booking.discount_amount > 0 && (
          <div className="flex justify-between gap-4 text-sm text-green-600">
            <span>Giảm giá{booking.promo_code ? ` (${booking.promo_code})` : ''}</span>
            <span className="min-w-[120px] whitespace-nowrap text-right tabular-nums">-{formatVnd(booking.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4 pt-1 text-base font-bold">
          <span className="text-gray-800">Tổng cộng</span>
          <span className="min-w-[120px] whitespace-nowrap text-right tabular-nums text-orange-600">
            {formatVnd(booking.total_amount)}
          </span>
        </div>
      </div>

      <PaymentQrMock booking={booking} />

      <button
        onClick={onConfirm}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400"
      >
        <CheckCircle className="h-4 w-4 shrink-0" />
        {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
      </button>

      <button
        onClick={onCancel}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 active:bg-red-100 disabled:opacity-50"
      >
        <XCircle className="h-4 w-4 shrink-0" />
        Hủy đặt vé
      </button>
    </div>
  );
}
