CREATE TABLE IF NOT EXISTS tickets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  booking_id    INT NOT NULL,
  seat_id       INT NOT NULL,
  qr_code       VARCHAR(500) NOT NULL,
  status        ENUM('active', 'used', 'cancelled') NOT NULL DEFAULT 'active',
  checked_in_at TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT uq_tickets_qr_code UNIQUE (qr_code),
  CONSTRAINT fk_tickets_booking  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_seat     FOREIGN KEY (seat_id)    REFERENCES seats(id),

  INDEX idx_tickets_booking_id (booking_id),
  INDEX idx_tickets_seat_id    (seat_id),
  INDEX idx_tickets_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
