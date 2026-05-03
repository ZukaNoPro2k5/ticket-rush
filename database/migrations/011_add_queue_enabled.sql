-- Add queue_enabled flag to events.
-- When TRUE, customers must enter a virtual waiting room before they can
-- POST /api/bookings for that event. Admin toggles per event when expecting
-- flash-sale traffic.

ALTER TABLE events
  ADD COLUMN queue_enabled BOOLEAN NOT NULL DEFAULT FALSE
  AFTER status;
