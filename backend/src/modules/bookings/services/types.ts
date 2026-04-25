import { RowDataPacket } from 'mysql2';

export interface BookingRow extends RowDataPacket {
  id: number;
  user_id: number;
  event_id: number;
  promo_code_id: number | null;
  discount_amount: number;
  total_amount: number;
  status: string;
  expires_at: string;
  confirmed_at: string | null;
  created_at: string;
}

export interface SeatPriceRow extends RowDataPacket {
  id: number;
  zone_id: number;
  price: number;
}

export interface PromoRow extends RowDataPacket {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  event_id: number | null;
  min_amount: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface BookingSeatRow extends RowDataPacket {
  seat_id: number;
}
