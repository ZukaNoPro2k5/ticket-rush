import type { Seat } from '@/types';

export interface PendingBooking {
  id: number;
  seat_ids: number[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  promo_code: string | null;
  expires_at: string;
}

export interface ZoneData {
  id: number;
  name: string;
  color: string;
  price: number;
  rows: Map<string, Seat[]>;
}

export function groupSeatsByZone(seats: Seat[], preferredZoneOrder: number[] = []): ZoneData[] {
  const map = new Map<number, ZoneData>();

  for (const seat of seats) {
    if (!map.has(seat.zone_id)) {
      map.set(seat.zone_id, {
        id: seat.zone_id,
        name: seat.zone_name,
        color: seat.zone_color,
        price: seat.zone_price,
        rows: new Map(),
      });
    }
    const zone = map.get(seat.zone_id)!;
    if (!zone.rows.has(seat.row_label)) {
      zone.rows.set(seat.row_label, []);
    }
    zone.rows.get(seat.row_label)!.push(seat);
  }

  for (const zone of map.values()) {
    zone.rows = new Map([...zone.rows.entries()].sort());
    for (const row of zone.rows.values()) {
      row.sort((a: Seat, b: Seat) => a.col_number - b.col_number);
    }
  }

  const zoneRank = new Map(preferredZoneOrder.map((id, index) => [id, index]));
  return [...map.values()].sort((a, b) => {
    const aRank = zoneRank.get(a.id);
    const bRank = zoneRank.get(b.id);
    if (aRank !== undefined || bRank !== undefined) {
      return (aRank ?? Number.MAX_SAFE_INTEGER) - (bRank ?? Number.MAX_SAFE_INTEGER);
    }
    return a.id - b.id;
  });
}

export function getSeatBg(
  seat: Seat,
  selectedIds: Set<number>,
  booking: PendingBooking | null,
): string {
  if (seat.status === 'sold') return '#374151';
  if (seat.status === 'locked') {
    if (booking?.seat_ids.includes(seat.id)) return '#ff6b35';
    return '#9ca3af';
  }
  return selectedIds.has(seat.id) ? '#ff6b35' : seat.zone_color;
}

export function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  const r = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
  return r?.error?.message ?? fallback;
}
