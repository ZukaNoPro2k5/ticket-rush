CREATE TABLE IF NOT EXISTS promo_codes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(50) NOT NULL,
  discount_type  ENUM('percent', 'fixed') NOT NULL,
  discount_value DECIMAL(12, 0) NOT NULL,
  max_uses       INT,
  used_count     INT NOT NULL DEFAULT 0,
  event_id       INT,
  min_amount     DECIMAL(12, 0) NOT NULL DEFAULT 0,
  starts_at      TIMESTAMP NOT NULL,
  expires_at     TIMESTAMP NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_promo_codes_code UNIQUE (code),
  CONSTRAINT fk_promo_codes_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,

  INDEX idx_promo_codes_event_id (event_id),
  INDEX idx_promo_codes_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
