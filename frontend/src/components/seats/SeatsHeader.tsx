'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { formatMmSs } from '@/lib/utils/seatUtils';

interface Props {
  eventId: number;
  hasBooking: boolean;
  countdown: number;
}

export function SeatsHeader({ eventId, hasBooking, countdown }: Props) {
  return (
    <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link
          href={`/events/${eventId}`}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Quay lại"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="font-semibold text-gray-800">Chọn ghế ngồi</span>

        {hasBooking && (
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
  );
}
