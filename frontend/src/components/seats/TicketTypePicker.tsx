'use client';

import { Minus, Plus, Ticket } from 'lucide-react';
import type { Seat } from '@/types';
import type { PendingBooking, ZoneData } from '@/lib/utils/seatUtils';

interface Props {
  zones: ZoneData[];
  selectedIds: Set<number>;
  booking: PendingBooking | null;
  onChange: (next: Set<number>) => void;
  mode: 'zoned' | 'admission';
  maxTickets: number;
}

function zoneSeats(zone: ZoneData): Seat[] {
  return [...zone.rows.values()].flat();
}

export function TicketTypePicker({ zones, selectedIds, booking, onChange, mode, maxTickets }: Props) {
  return (
    <div className="min-w-0 flex-1 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <Ticket className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-stone-900">
            {mode === 'zoned' ? 'Chọn khu vực' : 'Chọn loại vé'}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {mode === 'zoned'
              ? 'Chọn số lượng vé cho từng khu, không cần chọn ghế cụ thể.'
              : 'Chọn số lượng vé vào cửa, hệ thống sẽ giữ suất còn trống cho bạn.'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {zones.map((zone) => {
          const seats = zoneSeats(zone);
          const availableSeats = seats.filter((seat) => seat.status === 'available');
          const chosenSeats = seats.filter((seat) => selectedIds.has(seat.id));
          const count = chosenSeats.length;
          const soldCount = seats.length - availableSeats.length;
          const disabled = !!booking;

          const increment = () => {
            if (disabled) return;
            if (selectedIds.size >= maxTickets) return;
            const nextSeat = availableSeats.find((seat) => !selectedIds.has(seat.id));
            if (!nextSeat) return;
            onChange(new Set([...selectedIds, nextSeat.id]));
          };

          const decrement = () => {
            if (disabled || count === 0) return;
            const lastSelected = chosenSeats[chosenSeats.length - 1];
            const next = new Set(selectedIds);
            next.delete(lastSelected.id);
            onChange(next);
          };

          return (
            <div
              key={zone.id}
              className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: zone.color }} />
                  <h3 className="font-semibold text-stone-900">{zone.name}</h3>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-500">
                  <span>{zone.price.toLocaleString('vi-VN')}đ / vé</span>
                  <span>{availableSeats.length.toLocaleString('vi-VN')} còn trống</span>
                  {soldCount > 0 && <span>{soldCount.toLocaleString('vi-VN')} đã giữ hoặc bán</span>}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={decrement}
                  disabled={disabled || count === 0}
                  className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
                  aria-label={`Giảm số vé ${zone.name}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-lg font-bold tabular-nums text-stone-900">{count}</span>
                <button
                  type="button"
                  onClick={increment}
                  disabled={disabled || count >= availableSeats.length || selectedIds.size >= maxTickets}
                  className="grid h-10 w-10 place-items-center rounded-full bg-stone-900 text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
                  aria-label={`Tăng số vé ${zone.name}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
