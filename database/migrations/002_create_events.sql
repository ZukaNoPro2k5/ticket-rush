CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  category    ENUM('music', 'stage', 'sports', 'workshop', 'other') NOT NULL DEFAULT 'other',
  venue       VARCHAR(255) NOT NULL,
  event_date  DATETIME NOT NULL,
  poster_url  VARCHAR(500),
  status      ENUM('draft', 'published', 'cancelled', 'completed') NOT NULL DEFAULT 'draft',
  created_by  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_events_created_by FOREIGN KEY (created_by) REFERENCES users(id),

  INDEX idx_events_status      (status),
  INDEX idx_events_event_date  (event_date),
  INDEX idx_events_category    (category),
  INDEX idx_events_created_by  (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
