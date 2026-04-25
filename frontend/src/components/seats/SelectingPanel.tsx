'use client';

import { Clock, Tag } from 'lucide-react';
import type { Seat } from '@/types';

interface Props {
  selectedSeats: Seat[];
  subtotal: number;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  submitting: boolean;
  onBook: () => void;
}

export function SelectingPanel({
  selectedSeats,
  subtotal,
  promoCode,
  onPromoCodeChange,
  submitting,
  onBook,
}: Props) {
  const count = selectedSeats.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
      <h2 className="font-semibold text-gray-800">Ghế đã chọn</h2>

      {count === 0 ? (
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

      {count > 0 && (
        <div className="border-t pt-3 flex justify-between font-bold">
          <span className="text-gray-700">Tạm tính ({count} ghế)</span>
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
          onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
          placeholder="Nhập mã..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 uppercase tracking-wider placeholder:uppercase placeholder:tracking-normal placeholder:text-gray-300"
        />
      </div>

      <button
        onClick={onBook}
        disabled={submitting || count === 0}
        className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {submitting
          ? 'Đang xử lý...'
          : count > 0
            ? `Đặt ${count} ghế`
            : 'Chọn ghế để tiếp tục'}
      </button>

      {count > 0 && (
        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
          <Clock className="w-3 h-3 shrink-0" />
          Ghế sẽ được giữ 10 phút sau khi đặt
        </p>
      )}
    </div>
  );
}
