-- =============================================
-- Migration 021: Repair seeded seat layouts
-- =============================================
-- Repeated reseeds used to duplicate zones because `seat_zones`
-- had no natural uniqueness guard. Keep the oldest zone per
-- event/name pair, then make future reseeds idempotent.

CREATE TEMPORARY TABLE tmp_zone_keepers AS
SELECT event_id, name, MIN(id) AS keep_id
FROM seat_zones
GROUP BY event_id, name;

DELETE sz
FROM seat_zones sz
JOIN tmp_zone_keepers keeper
  ON keeper.event_id = sz.event_id
 AND keeper.name = sz.name
WHERE sz.id <> keeper.keep_id
  AND NOT EXISTS (
    SELECT 1
    FROM seats s
    JOIN booking_seats bs ON bs.seat_id = s.id
    WHERE s.zone_id = sz.id
  );

DROP TEMPORARY TABLE IF EXISTS tmp_zone_keepers;

ALTER TABLE seat_zones
  ADD CONSTRAINT uq_seat_zones_event_name UNIQUE (event_id, name);

-- Existing seeded events are all seated events. Keep their matrices aligned
-- with the live admin rules: at most 26 rows × 50 columns.
UPDATE seat_zones sz
JOIN events e ON e.id = sz.event_id
SET sz.total_rows = LEAST(GREATEST(sz.total_rows, 1), 26),
    sz.total_cols = LEAST(GREATEST(sz.total_cols, 1), 50)
WHERE e.seating_mode = 'seated';

-- Backfill any missing seats from the zone matrix so every published seeded
-- event has real inventory instead of merely decorative zones.
DROP TEMPORARY TABLE IF EXISTS tmp_row_seq;
CREATE TEMPORARY TABLE tmp_row_seq (n INT PRIMARY KEY);
INSERT INTO tmp_row_seq (n) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
  (11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
  (21),(22),(23),(24),(25),(26);

DROP TEMPORARY TABLE IF EXISTS tmp_col_seq;
CREATE TEMPORARY TABLE tmp_col_seq (n INT PRIMARY KEY);
INSERT INTO tmp_col_seq (n) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
  (11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
  (21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
  (31),(32),(33),(34),(35),(36),(37),(38),(39),(40),
  (41),(42),(43),(44),(45),(46),(47),(48),(49),(50);

INSERT IGNORE INTO seats (zone_id, row_label, col_number)
SELECT
  sz.id,
  CHAR(64 + r.n) AS row_label,
  c.n AS col_number
FROM seat_zones sz
JOIN events e ON e.id = sz.event_id
JOIN tmp_row_seq r ON r.n <= sz.total_rows
JOIN tmp_col_seq c ON c.n <= sz.total_cols
WHERE e.seating_mode = 'seated';

DROP TEMPORARY TABLE IF EXISTS tmp_row_seq;
DROP TEMPORARY TABLE IF EXISTS tmp_col_seq;
