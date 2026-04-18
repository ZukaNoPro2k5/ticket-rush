CREATE TABLE IF NOT EXISTS seats (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  zone_id    INT NOT NULL,
  row_label  VARCHAR(5) NOT NULL,
  col_number INT NOT NULL,
  status     ENUM('available', 'locked', 'sold') NOT NULL DEFAULT 'available',
  locked_by  INT,
  locked_at  TIMESTAMP NULL,

  CONSTRAINT fk_seats_zone      FOREIGN KEY (zone_id)   REFERENCES seat_zones(id) ON DELETE CASCADE,
  CONSTRAINT fk_seats_locked_by FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT uq_seat_position UNIQUE (zone_id, row_label, col_number),

  INDEX idx_seat_release (status, locked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
