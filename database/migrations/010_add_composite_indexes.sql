-- ============================================================
-- 010_add_composite_indexes.sql
-- Performance: Composite indexes for hot-path queries.
--
-- Why composite vs single-column:
--   MySQL chỉ dùng được 1 index per table per query (trừ index_merge).
--   Composite covers cases như:
--     SELECT ... WHERE status = 'published' AND event_date > NOW()
--     ORDER BY event_date  -- index trên (status, event_date) loại bỏ filesort
-- ============================================================

-- Events: homepage "upcoming events" + admin listing
-- Pattern: WHERE status = ? AND event_date > NOW() ORDER BY event_date
ALTER TABLE events
  ADD INDEX idx_events_status_date (status, event_date);

-- Bookings: user's order history with status filter
-- Pattern: WHERE user_id = ? AND status = ? ORDER BY created_at DESC
ALTER TABLE bookings
  ADD INDEX idx_bookings_user_status_created (user_id, status, created_at DESC);

-- Bookings: cron job to release expired pending bookings
-- Pattern: WHERE status = 'pending' AND expires_at < NOW()
ALTER TABLE bookings
  ADD INDEX idx_bookings_status_expires (status, expires_at);

-- Tickets: ticket lookup by booking + seat (used in QR resolve)
-- Pattern: WHERE booking_id = ? AND seat_id = ?
ALTER TABLE tickets
  ADD INDEX idx_tickets_booking_seat (booking_id, seat_id);

-- Tickets: user's "my tickets" listing with status filter
-- Pattern: JOIN bookings WHERE bookings.user_id = ? AND tickets.status = ?
ALTER TABLE tickets
  ADD INDEX idx_tickets_status_created (status, created_at DESC);

-- Seats: fill-rate aggregation per zone
-- Pattern: WHERE zone_id = ? AND status = 'sold'
ALTER TABLE seats
  ADD INDEX idx_seats_zone_status (zone_id, status);

-- Reviews: paginated review feed per event sorted by date
-- Pattern: WHERE event_id = ? ORDER BY created_at DESC
ALTER TABLE reviews
  ADD INDEX idx_reviews_event_created (event_id, created_at DESC);

-- Booking_seats: aggregation by event for stats
-- (no change needed — booking_id index already covers JOIN paths)
