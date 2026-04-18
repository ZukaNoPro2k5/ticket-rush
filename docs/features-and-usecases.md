# TicketRush — Use Case & Kiến trúc

> Danh sách chức năng chi tiết xem tại `docs/features.docx`.

---

## 1. Use Case Diagram (Văn bản)

### Actor: Customer (Khán giả)
- UC-01: Đăng ký tài khoản
- UC-02: Đăng nhập / Đăng xuất
- UC-03: Cập nhật hồ sơ cá nhân
- UC-04: Xem danh sách sự kiện (lọc theo danh mục, tìm kiếm)
- UC-05: Xem chi tiết sự kiện
- UC-06: Xem sơ đồ ghế trực quan (realtime)
- UC-07: Chọn ghế và giữ chỗ (10 phút)
- UC-08: Xem giỏ vé + đếm ngược
- UC-09: Huỷ giữ ghế
- UC-10: Áp mã giảm giá (promo code)
- UC-11: Xác nhận thanh toán (giả lập)
- UC-12: Xem vé điện tử + QR Code
- UC-13: Nhận email xác nhận vé + QR
- UC-14: Xem lịch sử đặt vé
- UC-15: Đánh giá & bình luận sự kiện (chỉ sau khi event completed, chỉ người đã mua vé)
- UC-16: Chat với AI Chatbot hỗ trợ

### Actor: Admin (Quản trị viên)
- UC-17: Đăng nhập (role admin)
- UC-18: Tạo mới sự kiện (kèm danh mục)
- UC-19: Cấu hình Seat Zone (tên, màu, giá, số hàng × cột)
- UC-20: Publish / Huỷ / Kết thúc sự kiện
- UC-21: Xem danh sách tất cả sự kiện
- UC-22: Tạo và quản lý mã giảm giá
- UC-23: Xem Real-time Dashboard (doanh thu, fill rate)
- UC-24: Xem thống kê khán giả (tuổi, giới tính)

### Actor: Staff (Nhân viên soát vé) — App riêng
- UC-25: Đăng nhập (role admin)
- UC-26: Quét QR Code bằng camera điện thoại → check-in vé (active → used)

### Actor: System (Hệ thống tự động)
- UC-27: Tự động release ghế hết hạn (Cronjob)
- UC-28: Broadcast cập nhật trạng thái ghế (Socket.io)
- UC-29: Điều phối Virtual Queue (Redis + background worker)
- UC-30: Gửi email xác nhận khi booking confirmed

---

## 3. Luồng nghiệp vụ chính — Đặt vé

```
[Customer vào trang sự kiện]
    → Xem sơ đồ ghế (realtime qua socket)
    → Click chọn ghế
        → Backend: BEGIN TRANSACTION
        → SELECT status FROM seats WHERE id = ? FOR UPDATE  ← Row lock
        → Nếu status != 'available' → lỗi "ghế đã được giữ"
        → UPDATE seats SET status='locked', locked_by=userId, locked_at=NOW()
        → INSERT INTO bookings ...
        → INSERT INTO booking_seats ...
        → COMMIT
        → Broadcast socket: ghế X → 'locked'
    → Frontend: hiện giỏ vé + đếm ngược 10 phút
    → Customer bấm "XÁC NHẬN THANH TOÁN"
        → UPDATE bookings SET status='confirmed', confirmed_at=NOW()
        → UPDATE seats SET status='sold'
        → INSERT INTO tickets (qr_code=UUID) ...
        → Broadcast socket: ghế X → 'sold'
    → Hiển thị vé + QR Code

[Nếu hết 10 phút mà chưa thanh toán - Cronjob]
    → SELECT * FROM seats WHERE status='locked' AND locked_at < NOW() - INTERVAL 10 MINUTE
    → UPDATE seats SET status='available', locked_by=NULL, locked_at=NULL
    → UPDATE bookings SET status='cancelled'
    → Broadcast socket: ghế X → 'available'
```

---

## 4. Database Schema (tóm tắt)

Xem chi tiết tại `docs/dbdiagram.dbml`.

| Bảng | Mục đích |
|------|----------|
| `users` | Tài khoản (customer + admin) |
| `events` | Sự kiện (+ category mới) |
| `seat_zones` | Zone ghế trong sự kiện (VIP, Standard...) |
| `seats` | Từng ghế cụ thể (row × col), lifecycle: available/locked/sold |
| `bookings` | Đơn đặt vé + promo code + discount |
| `booking_seats` | Chi tiết ghế trong booking (snapshot giá) |
| `tickets` | Vé đã thanh toán + QR code + checked_in_at |
| `reviews` | Đánh giá sự kiện (1-5 sao + comment, unique per user/event) |
| `promo_codes` | Mã giảm giá (%, VND, hạn lượt, hạn thời gian) |

---

## 5. Kiến trúc Module Backend (đã chốt)

```
backend/src/modules/
├── auth/          ← đăng ký, đăng nhập
├── users/         ← hồ sơ cá nhân
├── events/        ← CRUD sự kiện (+ category filter)
├── seat-zones/    ← cấu hình zone + tự sinh seats
├── seats/         ← xem trạng thái ghế
├── bookings/      ← giữ ghế, confirm, cancel, áp promo
├── tickets/       ← xem vé, QR, check-in API
├── reviews/       ← đánh giá & bình luận
├── promo-codes/   ← CRUD mã giảm giá
├── chatbot/       ← AI chatbot (Gemini API)
└── admin/         ← dashboard, thống kê
```

Mỗi module gồm: `routes.ts` · `controller.ts` · `service.ts` · `validation.ts`

### App soát vé (Check-in)
Trang web riêng biệt, mobile-friendly, deploy tách biệt.
Chỉ cần 1 page: login + camera scan QR → gọi API `POST /api/tickets/check-in`.
