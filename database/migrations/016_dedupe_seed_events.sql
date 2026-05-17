-- =============================================
-- Migration 016: Keep event seed data idempotent
-- =============================================

-- Seed rows used INSERT IGNORE before events had a natural unique key,
-- so repeated reseeds could duplicate the same event. Remove only duplicate
-- rows that have never been booked, then add a guardrail for future reseeds.
DELETE duplicate_event
FROM events duplicate_event
JOIN events keeper
  ON keeper.title = duplicate_event.title
 AND keeper.venue = duplicate_event.venue
 AND keeper.event_date = duplicate_event.event_date
 AND keeper.id < duplicate_event.id
LEFT JOIN bookings b
  ON b.event_id = duplicate_event.id
WHERE b.id IS NULL;

ALTER TABLE events
  ADD CONSTRAINT uq_events_identity UNIQUE (title, venue, event_date);
