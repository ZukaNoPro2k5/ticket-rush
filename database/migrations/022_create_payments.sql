-- =============================================
-- Migration 022: Persist simulated checkout payments
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  booking_id          INT NOT NULL,
  payment_method      VARCHAR(40) NOT NULL,
  amount              DECIMAL(12, 2) NOT NULL,
  status              ENUM('initiated', 'succeeded', 'failed', 'cancelled') NOT NULL DEFAULT 'initiated',
  provider_reference  VARCHAR(120) NULL,
  paid_at             TIMESTAMP NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT uq_payments_booking UNIQUE (booking_id),
  INDEX idx_payments_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
