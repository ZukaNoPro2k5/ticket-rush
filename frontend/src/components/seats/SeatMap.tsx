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
      title={`${seat.zone_name} — Hàng ${seat.row_label}, Ghế ${seat.col_number}\n${seat.zone_price.toLocaleString('vi-VN')}đ\n${statusLabel}`}
      style={{
        backgroundColor: bg,
        cursor: isClickable ? 'pointer' : 'default',
        outline: isSelected || isMyBookedSeat ? '2px solid #ff6b35' : '1px solid rgba(0,0,0,0.1)',
        outlineOffset: isSelected || isMyBookedSeat ? '1px' : '0',
      }}
      className="w-7 h-7 rounded-sm text-[9px] text-white font-bold transition-transform enabled:hover:scale-110 enabled:active:scale-95 shrink-0"
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
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
          style={{ backgroundColor: zone.color }}
        />
        {zone.name}
        <span className="text-gray-400 font-normal text-xs">
          — {zone.price.toLocaleString('vi-VN')}đ / ghế
        </span>
      </h3>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block">
          {[...zone.rows.entries()].map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="flex items-center gap-1 mb-1">
              <span className="w-5 shrink-0 text-center text-[10px] text-gray-400 font-medium">
                {rowLabel}
              </span>
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
    <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden min-w-0">
      {/* Stage */}
      <div className="flex justify-center pt-5 pb-3 px-6 bg-gradient-to-b from-gray-100 to-white">
        <div className="bg-gray-800 text-white text-[11px] font-bold tracking-[0.25em] px-12 py-2 rounded-b-3xl shadow">
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
          <p className="text-center text-gray-400 text-sm py-12">
            Sự kiện này chưa có thông tin ghế.
          </p>
        )}
      </div>
    </div>
  );
}
