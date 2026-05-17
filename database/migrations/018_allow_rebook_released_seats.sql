-- =============================================
-- Migration 018: Released seats must be bookable again
-- =============================================

-- booking_seats is historical. A seat may appear in several bookings over time
-- after an earlier pending booking is cancelled/expired and the seat is released.
-- Concurrency safety lives in seats.status + row locking, not a lifetime unique key.
ALTER TABLE booking_seats
  ADD INDEX idx_booking_seats_seat_id (seat_id);

ALTER TABLE booking_seats
  DROP INDEX uq_booking_seats_seat;
