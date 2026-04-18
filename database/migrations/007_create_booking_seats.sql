CREATE TABLE IF NOT EXISTS booking_seats (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  seat_id    INT NOT NULL,
  price      DECIMAL(12, 0) NOT NULL,

  CONSTRAINT uq_booking_seats_seat UNIQUE (seat_id),
  CONSTRAINT fk_booking_seats_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_seats_seat    FOREIGN KEY (seat_id)    REFERENCES seats(id),

  INDEX idx_booking_seats_booking_id (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
