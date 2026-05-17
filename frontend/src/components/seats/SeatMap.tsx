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
  const isMyBookedSeat = booking?.seat_ids.includes(seat.id) ?? false;
  const isClickable = seat.status === 'available' || isMyBookedSeat;
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
    <div className="relative group inline-block">
      <button
        onClick={() => onToggle(seat)}
        disabled={!isClickable}
        style={{
          backgroundColor: bg,
          cursor: isClickable ? 'pointer' : 'default',
          boxShadow: isSelected || isMyBookedSeat
            ? '0 0 0 2px #fff, 0 0 0 4px #ff6b35'
            : 'inset 0 -4px 0 0 rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
        }}
        className="h-8 w-8 shrink-0 rounded-t-lg rounded-b-sm text-[10px] font-bold text-white transition-all duration-200 enabled:hover:-translate-y-1 enabled:active:scale-95 flex flex-col items-center justify-start pt-1.5"
      >
        <span>{seat.col_number}</span>
      </button>

      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-max opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="rounded-xl bg-stone-900 px-3 py-2.5 text-xs text-white shadow-xl shadow-black/20 border border-stone-800">
          <div className="font-semibold text-stone-100 mb-1">
            {seat.zone_name} - T{seat.row_label} G{seat.col_number}
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-amber-400">{seat.zone_price.toLocaleString('vi-VN')}đ</span>
            <span className={seat.status === 'available' ? 'text-emerald-400' : 'text-stone-400'}>{statusLabel}</span>
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -ml-1.5 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-stone-900" />
        </div>
      </div>
    </div>
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
    <div
      className="w-max min-w-full rounded-[2rem] border border-black/5 p-6 shadow-sm md:p-8"
      style={{ backgroundColor: `${zone.color}10` }}
    >
      <div className="mb-8 border-b border-black/10 pb-4">
        <h3 className="flex items-center justify-center gap-3 text-xl font-[800] text-stone-800 uppercase tracking-wide">
          <span className="inline-block h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: zone.color }} />
          {zone.name}
          <span className="inline-block h-3 w-3 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: zone.color }} />
        </h3>
        <p className="mt-1.5 text-center text-sm font-semibold text-stone-600">
          {zone.price.toLocaleString('vi-VN')}đ / ghế
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        {[...zone.rows.entries()].map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="flex items-center gap-4">
            <div className="w-6 flex-shrink-0 text-right text-sm font-bold text-stone-500 uppercase">
              {rowLabel}
            </div>
            <div className="flex items-center gap-1.5 bg-black/[0.03] p-2 rounded-xl">
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
            <div className="w-6 flex-shrink-0 text-left text-sm font-bold text-stone-500 uppercase">
              {rowLabel}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SeatMap({ zones, selectedIds, booking, onToggleSeat }: Props) {
  return (
    <div className="relative flex h-[calc(100vh-7rem)] min-h-[760px] min-w-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-[#f4f5f6] shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center bg-gradient-to-b from-[#f4f5f6] via-[#f4f5f6]/90 to-transparent p-4 pb-10">
        <div className="rounded-b-[2.5rem] bg-[#1c1c1c] px-32 py-4 text-sm font-bold tracking-[0.4em] text-white shadow-xl border-b-4 border-stone-900">
          SÂN KHẤU CHÍNH
        </div>
      </div>

      {zones.length === 0 ? (
          <div className="flex w-full h-full flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-stone-100 border border-stone-200">
              <svg className="h-10 w-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-stone-800">Chưa có sơ đồ ghế</p>
            <p className="text-sm font-medium text-stone-500">Sự kiện chưa được cấu hình ghế ngồi.</p>
          </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-contain [scrollbar-gutter:stable_both-edges]">
            <div className="flex min-w-max flex-col items-center gap-10 px-6 pb-10 pt-32 md:px-10">
              {zones.map((zone) => (
                <ZoneGrid
                  key={zone.id}
                  zone={zone}
                  selectedIds={selectedIds}
                  booking={booking}
                  onToggleSeat={onToggleSeat}
                />
              ))}
            </div>
          </div>
          <div className="hidden border-t border-stone-200 bg-white/90 px-5 py-3 md:block">
            <SeatLegend zones={zones} />
          </div>
        </>
      )}
    </div>
  );
}
