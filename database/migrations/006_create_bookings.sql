CREATE TABLE IF NOT EXISTS bookings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  event_id        INT NOT NULL,
  promo_code_id   INT,
  discount_amount DECIMAL(12, 0) NOT NULL DEFAULT 0,
  total_amount    DECIMAL(12, 0) NOT NULL,
  status          ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  expires_at      TIMESTAMP NOT NULL,
  confirmed_at    TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_bookings_user       FOREIGN KEY (user_id)       REFERENCES users(id),
  CONSTRAINT fk_bookings_event      FOREIGN KEY (event_id)      REFERENCES events(id),
  CONSTRAINT fk_bookings_promo_code FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE SET NULL,

  INDEX idx_bookings_user_id   (user_id),
  INDEX idx_bookings_event_id  (event_id),
  INDEX idx_bookings_status    (status),
  INDEX idx_bookings_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
