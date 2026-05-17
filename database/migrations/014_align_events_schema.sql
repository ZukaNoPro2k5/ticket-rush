-- Admin event editor already supports these fields, so keep the table honest.

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE events ADD COLUMN seating_mode ENUM(''seated'', ''zoned'', ''admission'') NOT NULL DEFAULT ''seated'' AFTER category',
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

ALTER TABLE events
  MODIFY COLUMN category ENUM(
    'music', 'stage', 'sports', 'workshop', 'other',
    'arts', 'tech', 'food', 'entertainment'
  ) NOT NULL DEFAULT 'other';
