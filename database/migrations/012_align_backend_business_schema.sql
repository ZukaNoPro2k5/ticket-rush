-- Align backend business logic with the current API/frontend contract.
-- This migration is intentionally idempotent for existing development DBs.

-- Events: support seating modes used by backend/admin UI.
SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    "ALTER TABLE events ADD COLUMN seating_mode ENUM('seated', 'zoned', 'admission') NOT NULL DEFAULT 'seated' AFTER category",
    'DO 0'
  )
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'events'
    AND column_name = 'seating_mode'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Events: keep DB category enum in sync with backend validation/frontend filters.
ALTER TABLE events
  MODIFY COLUMN category ENUM(
    'music',
    'stage',
    'sports',
    'workshop',
    'other',
    'arts',
    'tech',
    'food',
    'entertainment'
  ) NOT NULL DEFAULT 'other';

-- booking_seats: keep booking-seat history while allowing a released seat to be rebooked.
SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'CREATE INDEX idx_booking_seats_seat_id ON booking_seats (seat_id)',
    'DO 0'
  )
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'booking_seats'
    AND index_name = 'idx_booking_seats_seat_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) > 0,
    'DROP INDEX uq_booking_seats_seat ON booking_seats',
    'DO 0'
  )
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'booking_seats'
    AND index_name = 'uq_booking_seats_seat'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE booking_seats ADD CONSTRAINT uq_booking_seats_booking_seat UNIQUE (booking_id, seat_id)',
    'DO 0'
  )
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'booking_seats'
    AND index_name = 'uq_booking_seats_booking_seat'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- tickets: prevent duplicate tickets for the same booking seat.
SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE tickets ADD CONSTRAINT uq_tickets_booking_seat UNIQUE (booking_id, seat_id)',
    'DO 0'
  )
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'tickets'
    AND index_name = 'uq_tickets_booking_seat'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
