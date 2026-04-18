// =============================================
// Shared TypeScript types — TicketRush Frontend
// =============================================

// --- API Response wrapper ---
export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// --- User ---
export type UserRole = 'customer' | 'admin';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  gender: Gender | null;
  birth_date: string | null;
  role: UserRole;
  created_at: string;
}

export interface AuthData {
  token: string;
  user: Pick<User, 'id' | 'email' | 'full_name' | 'role'>;
}

// --- Event ---
export type EventCategory = 'music' | 'stage' | 'sports' | 'workshop' | 'other';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface EventListItem {
  id: number;
  title: string;
  category: EventCategory;
  venue: string;
  event_date: string;
  poster_url: string | null;
  status: EventStatus;
  min_price: number;
  max_price: number;
  available_seats: number;
  total_seats: number;
}

export interface SeatZoneSummary {
  id: number;
  name: string;
  price: number;
  color: string;
  total_rows: number;
  total_cols: number;
  available_seats: number;
  total_seats: number;
}

export interface EventDetail extends Omit<EventListItem, 'min_price' | 'max_price' | 'available_seats' | 'total_seats'> {
  description: string | null;
  created_by: number;
  created_at: string;
  seat_zones: SeatZoneSummary[];
  average_rating: number | null;
  review_count: number;
}

// --- Seat Zone ---
export interface SeatZone {
  id: number;
  event_id: number;
  name: string;
  price: number;
  color: string;
  total_rows: number;
  total_cols: number;
}

// --- Seat ---
export type SeatStatus = 'available' | 'locked' | 'sold';

export interface Seat {
  id: number;
  zone_id: number;
  zone_name: string;
  zone_color: string;
  zone_price: number;
  row_label: string;
  col_number: number;
  status: SeatStatus;
}

// --- Booking ---
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingListItem {
  id: number;
  event: Pick<EventListItem, 'id' | 'title' | 'event_date' | 'poster_url'>;
  total_amount: number;
  status: BookingStatus;
  seat_count: number;
  confirmed_at: string | null;
}

export interface BookingSeat {
  id: number;
  zone_name: string;
  row_label: string;
  col_number: number;
  price: number;
}

export interface BookingDetail {
  id: number;
  user_id: number;
  event: Pick<EventDetail, 'id' | 'title' | 'venue' | 'event_date'>;
  seats: BookingSeat[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  promo_code: string | null;
  status: BookingStatus;
  expires_at: string;
  confirmed_at: string | null;
}

// --- Ticket ---
export type TicketStatus = 'active' | 'used' | 'cancelled';

export interface TicketListItem {
  id: number;
  event: Pick<EventDetail, 'id' | 'title' | 'venue' | 'event_date'>;
  seat: Pick<Seat, 'zone_name' | 'row_label' | 'col_number'>;
  status: TicketStatus;
  checked_in_at: string | null;
  created_at: string;
}

export interface TicketDetail extends TicketListItem {
  booking_id: number;
  holder: Pick<User, 'full_name' | 'email'>;
  qr_code: string;
  price: number;
}

// --- Review ---
export interface Review {
  id: number;
  user: Pick<User, 'id' | 'full_name'>;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewSummary {
  items: Review[];
  summary: {
    average_rating: number;
    total: number;
  };
  pagination: PaginatedResponse<Review>['pagination'];
}

// --- Promo Code ---
export type DiscountType = 'percent' | 'fixed';

export interface PromoCode {
  id: number;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  event_id: number | null;
  min_amount: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface PromoValidationResult {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  final_amount: number;
}

// --- Admin Dashboard ---
export interface DashboardData {
  total_revenue: number;
  total_bookings: number;
  total_tickets_sold: number;
  total_events: number;
  events_by_status: Record<EventStatus, number>;
  revenue_by_month: { month: string; revenue: number }[];
  top_events: {
    id: number;
    title: string;
    revenue: number;
    tickets_sold: number;
    fill_rate: number;
  }[];
}

export interface AudienceData {
  gender_distribution: Record<Gender | 'unknown', number>;
  age_distribution: { range: string; count: number }[];
}

// --- Socket.io Events ---
export interface SeatStatusChangedPayload {
  seat_id: number;
  status: SeatStatus;
}
