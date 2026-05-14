'use client';

import type { Seat } from '@/types';
import { getSeatBg, type PendingBooking, type ZoneData } from '@/lib/utils/seatUtils';
import { SeatLegend } from './SeatLegend';

interface Props {
  zones: ZoneData[];
  selectedIds: Set<number>;
  booking: PendingBooking | null;
  onToggleSeat: (seat: Seat) => void;
}

function SeatButton({
  seat,
  selectedIds,
  booking,
  onToggle,
}: {
  seat: Seat;
  selectedIds: Set<number>;
  booking: PendingBooking | null;
  onToggle: (seat: Seat) => void;
}) {
  const bg = getSeatBg(seat, selectedIds, booking);
  const isClickable = seat.status === 'available' && !booking;
  const isMyBookedSeat = booking?.seat_ids.includes(seat.id) ?? false;
  const isSelected = selectedIds.has(seat.id);
  const statusLabel =
    seat.status === 'available'
      ? 'Còn trống'
      : seat.status === 'locked'
        ? isMyBookedSeat
          ? 'Ghế của bạn'
          : 'Đang giữ'
        : 'Đã bán';

  return (
    <button
      onClick={() => onToggle(seat)}
      disabled={!isClickable}
      title={`${seat.zone_name} - Hàng ${seat.row_label}, Ghế ${seat.col_number}\n${seat.zone_price.toLocaleString('vi-VN')}đ\n${statusLabel}`}
      style={{
        backgroundColor: bg,
        cursor: isClickable ? 'pointer' : 'default',
        outline: isSelected || isMyBookedSeat ? '2px solid #ff6b35' : '1px solid rgba(0,0,0,0.1)',
        outlineOffset: isSelected || isMyBookedSeat ? '1px' : '0',
      }}
      className="h-7 w-7 shrink-0 rounded-sm text-[9px] font-bold text-white transition-transform enabled:hover:scale-110 enabled:active:scale-95"
    >
      {seat.col_number}
    </button>
  );
}

function ZoneGrid({
  zone,
  selectedIds,
  booking,
  onToggleSeat,
}: {
  zone: ZoneData;
  selectedIds: Set<number>;
  booking: PendingBooking | null;
  onToggleSeat: (seat: Seat) => void;
}) {
  return (
    <div className="py-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: zone.color }} />
        {zone.name}
        <span className="text-xs font-normal text-gray-400">
          - {zone.price.toLocaleString('vi-VN')}đ / ghế
        </span>
      </h3>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block">
          {[...zone.rows.entries()].map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="mb-1 flex items-center gap-1">
              <span className="w-5 shrink-0 text-center text-[10px] font-medium text-gray-400">{rowLabel}</span>
              {rowSeats.map((seat) => (
                <SeatButton
                  key={seat.id}
                  seat={seat}
                  selectedIds={selectedIds}
                  booking={booking}
                  onToggle={onToggleSeat}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SeatMap({ zones, selectedIds, booking, onToggleSeat }: Props) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex justify-center bg-gradient-to-b from-gray-100 to-white px-6 pb-3 pt-5">
        <div className="rounded-b-3xl bg-gray-800 px-12 py-2 text-[11px] font-bold tracking-[0.25em] text-white shadow">
          SÂN KHẤU
        </div>
      </div>

      <SeatLegend zones={zones} />

      <div className="divide-y px-4 pb-8">
        {zones.map((zone) => (
          <ZoneGrid
            key={zone.id}
            zone={zone}
            selectedIds={selectedIds}
            booking={booking}
            onToggleSeat={onToggleSeat}
          />
        ))}

        {zones.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-stone-100">
              <svg className="h-7 w-7 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-stone-600">Chưa có sơ đồ ghế</p>
            <p className="text-xs text-stone-400">Ban tổ chức chưa cấu hình ghế cho sự kiện này.</p>
          </div>
        )}
      </div>
    </div>
  );
}
