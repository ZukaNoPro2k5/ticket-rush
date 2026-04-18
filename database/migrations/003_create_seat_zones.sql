CREATE TABLE IF NOT EXISTS seat_zones (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  event_id   INT NOT NULL,
  name       VARCHAR(50) NOT NULL,
  price      DECIMAL(12, 0) NOT NULL,
  color      VARCHAR(7) NOT NULL,
  total_rows INT NOT NULL,
  total_cols INT NOT NULL,

  CONSTRAINT fk_seat_zones_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,

  INDEX idx_seat_zones_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
