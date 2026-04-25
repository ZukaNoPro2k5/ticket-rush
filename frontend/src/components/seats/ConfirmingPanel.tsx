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
            <span>Giảm giá{booking.promo_code ? ` (${booking.promo_code})` : ''}</span>
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

      <button
        onClick={onConfirm}
        disabled={submitting}
        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-4 h-4 shrink-0" />
        {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
      </button>

      <button
        onClick={onCancel}
        disabled={submitting}
        className="w-full border border-red-200 text-red-500 hover:bg-red-50 active:bg-red-100 disabled:opacity-50 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <XCircle className="w-4 h-4 shrink-0" />
        Hủy đặt vé
      </button>
    </div>
  );
}
