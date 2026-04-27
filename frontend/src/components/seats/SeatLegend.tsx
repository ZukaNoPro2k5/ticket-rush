'use client';

import type { ZoneData } from '@/lib/utils/seatUtils';

interface Props {
  zones: ZoneData[];
}

export function SeatLegend({ zones }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-y bg-gray-50 px-6 py-3">
      {zones.map((zone) => (
        <div key={zone.id} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span
            className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm"
            style={{ backgroundColor: zone.color }}
          />
          <span className="font-medium">{zone.name}</span>
          <span className="text-gray-400">{zone.price.toLocaleString('vi-VN')}đ</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm bg-orange-500" />
        <span>Đã chọn / Của bạn</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm bg-gray-400" />
        <span>Đang giữ</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-sm bg-gray-700" />
        <span>Đã bán</span>
      </div>
    </div>
  );
}
