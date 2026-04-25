'use client';

import type { ZoneData } from '@/lib/utils/seatUtils';

interface Props {
  zones: ZoneData[];
}

export function SeatLegend({ zones }: Props) {
  return (
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
  );
}
