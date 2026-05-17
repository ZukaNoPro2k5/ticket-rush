-- =============================================
-- Migration 019: guarantee one ticket per booking-seat pair
-- =============================================

-- Defensive cleanup for databases that may already contain duplicates from
-- earlier retry races. Keep the oldest ticket as the canonical one.
DELETE newer
FROM tickets newer
JOIN tickets older
  ON older.booking_id = newer.booking_id
 AND older.seat_id = newer.seat_id
 AND older.id < newer.id;

ALTER TABLE tickets
  ADD CONSTRAINT uq_tickets_booking_seat UNIQUE (booking_id, seat_id);
