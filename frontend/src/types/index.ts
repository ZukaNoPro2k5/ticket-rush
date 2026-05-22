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
  avatar_url: string | null;
  category_preferences?: EventCategory[] | null;
  preferred_city?: string | null;
  created_at: string;
}

export interface AuthData {
  token: string;
  user: Pick<User, 'id' | 'email' | 'full_name' | 'role'> & { avatar_url?: string | null };
}

// --- Event ---
export type EventCategory = 'music' | 'arts' | 'sports' | 'food' | 'entertainment' | 'workshop' | 'stage' | 'other';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type SeatingMode = 'seated' | 'zoned' | 'admission';

export interface EventLayoutPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface EventLayoutFixture {
  id: string;
  label: string;
  color: string;
  textColor: string;
  pos: EventLayoutPosition;
}

export interface EventLayoutConfig {
  pattern_id?: string | null;
  zone_ids?: number[];
  positions: EventLayoutPosition[];
  fixtures: EventLayoutFixture[];
}

/** Matches backend GET /api/events list item */
export interface Event {
  id: number;
  title: string;
  description: string | null;
  category: EventCategory;
  seating_mode: SeatingMode;
  venue: string;
  event_date: string;
  poster_url: string | null;
  status: EventStatus;
  queue_enabled?: boolean;
  layout_config?: EventLayoutConfig | null;
  created_by: number;
  created_at: string;
  min_price: number | null;
  max_price: number | null;
  available_seats: number | null;
  total_seats: number | null;
}

export interface AdminEvent {
  id: number;
  title: string;
  category: EventCategory;
  venue: string;
  event_date: string;
  poster_url: string | null;
  status: EventStatus;
  created_at: string;
  min_price: number | null;
  max_price: number | null;
  total_seats: number;
  available_seats: number;
  sold_seats: number;
  revenue: number;
}

/** Matches backend GET /api/events/:id (includes seat_zones) */
export interface EventDetail extends Event {
  seat_zones: SeatZone[];
}

/** Matches backend seat_zones row */
export interface SeatZone {
  id: number;
  event_id: number;
  name: string;
  price: number;
  color: string;
  total_rows: number;
  total_cols: number;
  available_seats?: number;
  total_seats?: number;
}

// --- Display model (derived from Event for UI rendering) ---
export type BadgeType = 'hot' | 'new' | 'almost-sold' | 'special';

export interface DisplayEvent {
  id: number;
  title: string;
  category: string;        // localized label e.g. "Âm nhạc"
  categoryKey: EventCategory;
  venue: string;
  city: string;
  date: string;            // ISO
  dateLabel: string;       // e.g. "T7, 28/06"
  timeLabel: string;       // e.g. "20:00"
  poster: string;
  priceFrom: number;
  priceTo: number;
  soldPercent: number;
  badge?: BadgeType;
  rankChange?: number;
  velocity?: number;
  organizer?: string;
}

/** Legacy aliases — keep for backwards compat with existing seat page */
export type EventListItem = Event;

export interface SeatZoneSummary extends SeatZone {
  available_seats: number;
  total_seats: number;
}

// --- Seat Zone (second definition removed — see SeatZone above) ---

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

export interface BookingRules {
  ticket_hold_minutes: number;
  max_tickets_per_booking: number;
}

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
  created_at: string;
  expires_at: string;
  confirmed_at: string | null;
  payment: {
    method: string;
    status: 'initiated' | 'succeeded' | 'failed' | 'cancelled';
    paid_at: string | null;
  } | null;
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

export interface PublicPromoCode extends PromoCode {
  event_title: string | null;
  event_category: EventCategory | null;
  created_at: string;
}

export interface PromoValidationResult {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  discount_amount: number;
  final_amount: number;
}

// --- Newsroom posts ---
export type PostStatus = 'draft' | 'published';

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  quote: string | null;
  author_name: string;
  category: string;
  cover_url: string;
  read_time_min: number;
  featured: boolean;
  status: PostStatus;
  view_count: number;
  published_at: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface PostStats {
  total: number;
  published: number;
  draft: number;
  categories: number;
  views: number;
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
