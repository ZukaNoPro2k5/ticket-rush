-- =============================================
-- Seed: 1 admin + 2 customers
-- Admin password: Admin@123
-- Customer password: User@123 (hash below)
-- =============================================

-- Hash for "Admin@123"
INSERT IGNORE INTO users (email, password_hash, full_name, phone, gender, birth_date, role)
VALUES (
  'admin@ticketrush.vn',
  '$2a$10$leuVj9n1WUTWkP.Pt07Q5.TlsToA1HQXG9Bqn2dPi4WGDIzhRoev2',
  'TicketRush Admin',
  '0901000001',
  'other',
  '1990-01-01',
  'admin'
);

-- Hash for "User@123" (pre-computed)
INSERT IGNORE INTO users (email, password_hash, full_name, phone, gender, birth_date, role)
VALUES
  (
    'nguyen.van.a@example.com',
    '$2a$10$N5kjJijLqfhGJH/OXLGDgeKjTjjZHLHiVfYqWE3XriRjxH.2YMnWS',
    'Nguyễn Văn An',
    '0901234567',
    'male',
    '1999-05-20',
    'customer'
  ),
  (
    'tran.thi.b@example.com',
    '$2a$10$N5kjJijLqfhGJH/OXLGDgeKjTjjZHLHiVfYqWE3XriRjxH.2YMnWS',
    'Trần Thị Bảo',
    '0907654321',
    'female',
    '2001-08-15',
    'customer'
  );

-- =============================================
-- Seed: 3 events (created by admin id=1)
-- Note: admin is always id=1 since it's inserted first
-- =============================================

INSERT IGNORE INTO events (title, description, category, venue, event_date, poster_url, status, created_by)
VALUES
  (
    'Coldplay Music Of The Spheres – Hà Nội 2026',
    'Đêm nhạc huyền thoại Coldplay lần đầu tiên đến Việt Nam. Một trải nghiệm âm nhạc không thể bỏ lỡ với sân khấu lộng lẫy, màn trình diễn đỉnh cao và ánh đèn LED rực rỡ khắp sân vận động.',
    'music',
    'Sân vận động Quốc gia Mỹ Đình, Hà Nội',
    '2026-08-15 19:00:00',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    'published',
    1
  ),
  (
    'Vở Diễn "Romeo và Juliet" – Nhà hát Lớn Hà Nội',
    'Tác phẩm kinh điển của Shakespeare được dàn dựng bởi đoàn kịch nghệ hàng đầu Việt Nam. Ngôn ngữ hiện đại, phục trang tráng lệ, cảm xúc chân thật.',
    'stage',
    'Nhà hát Lớn Hà Nội, 1 Tràng Tiền, Hoàn Kiếm',
    '2026-09-05 20:00:00',
    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
    'published',
    1
  ),
  (
    'GrandPrix Cờ vua Quốc tế Hà Nội 2026',
    'Giải cờ vua quốc tế quy tụ các kỳ thủ hàng đầu châu Á. Khán giả được theo dõi trực tiếp, giao lưu và nhận chữ ký từ các kỳ thủ.',
    'sports',
    'Cung Thể thao Hà Nội, 18 Trần Phú, Ba Đình',
    '2026-10-10 09:00:00',
    'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800',
    'draft',
    1
  );

-- =============================================
-- Seed: Seat zones cho event 1 (Coldplay)
-- =============================================

INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'VIP Golden', 3000000, '#FFD700', 3, 20  FROM events WHERE title LIKE 'Coldplay%' LIMIT 1;

INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Khu A – Hạng Nhất', 1500000, '#FF6B6B', 5, 30 FROM events WHERE title LIKE 'Coldplay%' LIMIT 1;

INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Khu B – Tiêu Chuẩn', 800000, '#4ECDC4', 8, 40  FROM events WHERE title LIKE 'Coldplay%' LIMIT 1;

-- =============================================
-- Seed: Seat zones cho event 2 (Romeo & Juliet)
-- =============================================

INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Tầng 1 – VIP', 1200000, '#9B59B6', 4, 15 FROM events WHERE title LIKE 'Vở Diễn%' LIMIT 1;

INSERT IGNORE INTO seat_zones (event_id, name, price, color, total_rows, total_cols)
SELECT id, 'Tầng 2 – Thường', 600000, '#3498DB', 6, 20  FROM events WHERE title LIKE 'Vở Diễn%' LIMIT 1;

-- =============================================
-- Seed: Seats (tự động từ zones)
-- Chạy stored procedure-style với vòng lặp là không thể trong SQL thuần
-- Seed ghế mẫu cho VIP Golden (zone đầu tiên) – 3 hàng x 20 ghế = 60 ghế
-- Ghi chú: Trong production, seats được tạo bởi API POST /seat-zones
-- =============================================

-- Lấy zone_id đầu tiên (VIP Golden của Coldplay)
SET @vip_zone_id = (
  SELECT sz.id FROM seat_zones sz
  JOIN events e ON e.id = sz.event_id
  WHERE e.title LIKE 'Coldplay%' AND sz.name = 'VIP Golden'
  LIMIT 1
);

-- Row A (1-20)
INSERT IGNORE INTO seats (zone_id, row_label, col_number) VALUES
(@vip_zone_id,'A',1),(@vip_zone_id,'A',2),(@vip_zone_id,'A',3),(@vip_zone_id,'A',4),(@vip_zone_id,'A',5),
(@vip_zone_id,'A',6),(@vip_zone_id,'A',7),(@vip_zone_id,'A',8),(@vip_zone_id,'A',9),(@vip_zone_id,'A',10),
(@vip_zone_id,'A',11),(@vip_zone_id,'A',12),(@vip_zone_id,'A',13),(@vip_zone_id,'A',14),(@vip_zone_id,'A',15),
(@vip_zone_id,'A',16),(@vip_zone_id,'A',17),(@vip_zone_id,'A',18),(@vip_zone_id,'A',19),(@vip_zone_id,'A',20);

-- Row B (1-20)
INSERT IGNORE INTO seats (zone_id, row_label, col_number) VALUES
(@vip_zone_id,'B',1),(@vip_zone_id,'B',2),(@vip_zone_id,'B',3),(@vip_zone_id,'B',4),(@vip_zone_id,'B',5),
(@vip_zone_id,'B',6),(@vip_zone_id,'B',7),(@vip_zone_id,'B',8),(@vip_zone_id,'B',9),(@vip_zone_id,'B',10),
(@vip_zone_id,'B',11),(@vip_zone_id,'B',12),(@vip_zone_id,'B',13),(@vip_zone_id,'B',14),(@vip_zone_id,'B',15),
(@vip_zone_id,'B',16),(@vip_zone_id,'B',17),(@vip_zone_id,'B',18),(@vip_zone_id,'B',19),(@vip_zone_id,'B',20);

-- Row C (1-20)
INSERT IGNORE INTO seats (zone_id, row_label, col_number) VALUES
(@vip_zone_id,'C',1),(@vip_zone_id,'C',2),(@vip_zone_id,'C',3),(@vip_zone_id,'C',4),(@vip_zone_id,'C',5),
(@vip_zone_id,'C',6),(@vip_zone_id,'C',7),(@vip_zone_id,'C',8),(@vip_zone_id,'C',9),(@vip_zone_id,'C',10),
(@vip_zone_id,'C',11),(@vip_zone_id,'C',12),(@vip_zone_id,'C',13),(@vip_zone_id,'C',14),(@vip_zone_id,'C',15),
(@vip_zone_id,'C',16),(@vip_zone_id,'C',17),(@vip_zone_id,'C',18),(@vip_zone_id,'C',19),(@vip_zone_id,'C',20);

-- =============================================
-- Seed: Promo code toàn hệ thống
-- =============================================

INSERT IGNORE INTO promo_codes (code, discount_type, discount_value, max_uses, event_id, min_amount, starts_at, expires_at, is_active)
VALUES
  ('WELCOME10', 'percent', 10, 200, NULL, 500000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
  ('COLD100K',  'fixed',   100000, 50, NULL, 800000, '2026-04-01 00:00:00', '2026-08-31 23:59:59', TRUE);
