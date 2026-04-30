'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import type { Seat } from '@/types';
import { formatMmSs, type PendingBooking } from '@/lib/utils/seatUtils';

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
            <div key={seat.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seat.zone_color }} />
                {seat.zone_name} - {seat.row_label}
                {seat.col_number}
              </span>
              <span className="shrink-0 font-medium text-gray-800">{seat.zone_price.toLocaleString('vi-VN')}đ</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 border-t pt-3">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Tạm tính ({bookingSeats.length} ghế)</span>
          <span>{booking.subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        {booking.discount_amount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Giảm giá{booking.promo_code ? ` (${booking.promo_code})` : ''}</span>
            <span>-{booking.discount_amount.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
        <div className="flex justify-between pt-1 text-base font-bold">
          <span className="text-gray-800">Tổng cộng</span>
          <span className="text-orange-600">{booking.total_amount.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

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
