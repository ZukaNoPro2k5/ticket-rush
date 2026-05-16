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
    <div className="sticky top-0 z-20 border-b bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link
          href={`/events/${eventId}`}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          aria-label="Quay lại"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="font-semibold text-gray-800">Chọn ghế ngồi</span>

        {hasBooking && (
          <span className={`ml-auto font-mono text-sm font-bold ${countdown < 120 ? 'text-red-500' : 'text-orange-500'}`}>
            {formatMmSs(countdown)}
          </span>
        )}
      </div>
    </div>
  );
}
