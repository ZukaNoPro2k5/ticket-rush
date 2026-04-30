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
    <div className="space-y-4 rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800">Ghế đã chọn</h2>

      {count === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Nhấn vào ghế trên sơ đồ để chọn
        </p>
      ) : (
        <div className="max-h-52 space-y-1.5 overflow-y-auto">
          {selectedSeats.map((seat) => (
            <div key={seat.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seat.zone_color }} />
                {seat.zone_name} - {seat.row_label}
                {seat.col_number}
              </span>
              <span className="shrink-0 font-medium text-gray-800">
                {seat.zone_price.toLocaleString('vi-VN')}đ
              </span>
            </div>
          ))}
        </div>
      )}

      {count > 0 && (
        <div className="flex justify-between border-t pt-3 font-bold">
          <span className="text-gray-700">Tạm tính ({count} ghế)</span>
          <span className="text-orange-600">{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
      )}

      <div>
        <label className="mb-1.5 flex items-center gap-1 text-xs text-gray-500">
          <Tag className="h-3 w-3" />
          Mã giảm giá (tùy chọn)
        </label>
        <input
          type="text"
          value={promoCode}
          onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
          placeholder="Nhập mã..."
          className="w-full rounded-lg border px-3 py-2 text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <button
        onClick={onBook}
        disabled={submitting || count === 0}
        className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700 disabled:bg-gray-100 disabled:text-gray-400"
      >
        {submitting ? 'Đang xử lý...' : count > 0 ? `Đặt ${count} ghế` : 'Chọn ghế để tiếp tục'}
      </button>

      {count > 0 && (
        <p className="flex items-center justify-center gap-1 text-center text-xs text-gray-400">
          <Clock className="h-3 w-3 shrink-0" />
          Ghế sẽ được giữ 10 phút sau khi đặt
        </p>
      )}
    </div>
  );
}
