-- Backfill seats for zones that declare rows/columns but do not have all seat rows yet.
-- This keeps old seed data intact while making displayed price ranges match buyable seats.

INSERT INTO seats (zone_id, row_label, col_number, status)
WITH RECURSIVE numbers(n) AS (
  SELECT 1
  UNION ALL
  SELECT n + 1
  FROM numbers
  WHERE n < 1000
)
SELECT
  sz.id,
  CASE
    WHEN row_nums.n <= 26 THEN CHAR(64 + row_nums.n)
    ELSE CONCAT('R', row_nums.n)
  END AS row_label,
  col_nums.n AS col_number,
  'available' AS status
FROM seat_zones sz
JOIN numbers row_nums ON row_nums.n <= sz.total_rows
JOIN numbers col_nums ON col_nums.n <= sz.total_cols
LEFT JOIN seats existing
  ON existing.zone_id = sz.id
 AND existing.row_label = CASE
   WHEN row_nums.n <= 26 THEN CHAR(64 + row_nums.n)
   ELSE CONCAT('R', row_nums.n)
 END
 AND existing.col_number = col_nums.n
WHERE sz.total_rows > 0
  AND sz.total_cols > 0
  AND existing.id IS NULL;
