-- Fix: add default seat zones for events that have none
DROP TEMPORARY TABLE IF EXISTS tmp_events_no_zones;
CREATE TEMPORARY TABLE tmp_events_no_zones AS
  SELECT e.id, e.category FROM events e
  WHERE NOT EXISTS (SELECT 1 FROM seat_zones sz WHERE sz.event_id = e.id);

INSERT INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP',
  CASE category
    WHEN 'music'    THEN 1500000
    WHEN 'stage'    THEN  800000
    WHEN 'sports'   THEN 1200000
    WHEN 'workshop' THEN 2000000
    ELSE                 1000000
  END, '#F59E0B', 5, 10
FROM tmp_events_no_zones;

INSERT INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Hạng A',
  CASE category
    WHEN 'music'    THEN  800000
    WHEN 'stage'    THEN  500000
    WHEN 'sports'   THEN  700000
    WHEN 'workshop' THEN 1200000
    ELSE                  600000
  END, '#3B82F6', 8, 15
FROM tmp_events_no_zones;

INSERT INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Hạng B',
  CASE category
    WHEN 'music'    THEN  400000
    WHEN 'stage'    THEN  250000
    WHEN 'sports'   THEN  350000
    WHEN 'workshop' THEN  600000
    ELSE                  300000
  END, '#10B981', 10, 20
FROM tmp_events_no_zones;

DROP TEMPORARY TABLE IF EXISTS tmp_events_no_zones;

SELECT COUNT(*) AS total_zones FROM seat_zones;
SELECT COUNT(*) AS events_with_no_zone FROM events e
WHERE NOT EXISTS (SELECT 1 FROM seat_zones sz WHERE sz.event_id = e.id);
