-- Persist the admin venue canvas instead of keeping it only in browser state.

SET @sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE events ADD COLUMN layout_config JSON NULL AFTER queue_enabled',
    'DO 0'
  )
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'events'
    AND column_name = 'layout_config'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS event_layout_patterns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(120) NOT NULL,
  seating_mode ENUM('seated', 'zoned') NOT NULL,
  diagram ENUM('rows', 'bands', 'concert', 'quadrant') NOT NULL,
  zones JSON NOT NULL,
  positions JSON NOT NULL,
  fixtures JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_event_layout_patterns_mode (seating_mode),
  INDEX idx_event_layout_patterns_updated (updated_at)
);
