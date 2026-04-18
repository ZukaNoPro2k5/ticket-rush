# TicketRush — API Specification

> Base URL: `http://localhost:4000/api`
> Tất cả response theo format: `{ success: boolean, data?: T, message?: string, error?: { code: string, message: string } }`
> Authenticated requests: `Authorization: Bearer <jwt_token>`

---

## Auth — `/api/auth`

### POST `/api/auth/register`
> Public

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "Nguyễn Văn A",
  "phone": "0901234567",          // optional
  "gender": "male",               // optional: "male"|"female"|"other"
  "birth_date": "1999-05-20"      // optional: YYYY-MM-DD
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { "id": 1, "email": "...", "full_name": "...", "role": "customer" }
  },
  "message": "Đăng ký thành công"
}
```

**Errors:** `400 VALIDATION_ERROR` | `409 EMAIL_TAKEN`

---

### POST `/api/auth/login`
> Public

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { "id": 1, "email": "...", "full_name": "...", "role": "customer" }
  }
}
```

**Errors:** `400 VALIDATION_ERROR` | `401 INVALID_CREDENTIALS`

---

### GET `/api/auth/me`
> Authenticated

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0901234567",
    "gender": "male",
    "birth_date": "1999-05-20",
    "role": "customer",
    "created_at": "2026-04-17T00:00:00Z"
  }
}
```

---

## Users — `/api/users`

### PUT `/api/users/me`
> Authenticated

**Request body (tất cả optional):**
```json
{
  "full_name": "Nguyễn Văn B",
  "phone": "0909999999",
  "gender": "male",
  "birth_date": "1999-05-20"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { /* updated user object */ },
  "message": "Cập nhật thành công"
}
```

---

### PUT `/api/users/me/password`
> Authenticated

**Request body:**
```json
{
  "current_password": "oldpass123",
  "new_password": "newpass456"
}
```

**Response 200:**
```json
{ "success": true, "message": "Đổi mật khẩu thành công" }
```

**Errors:** `400 VALIDATION_ERROR` | `401 WRONG_PASSWORD`

---

## Events — `/api/events`

### GET `/api/events`
> Public

**Query params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `category` | string | `music\|stage\|sports\|workshop\|other` |
| `status` | string | `published` (default), `draft`, `cancelled`, `completed` — admin only |
| `search` | string | Tìm trong title, venue |
| `page` | number | Default: 1 |
| `limit` | number | Default: 12, max: 50 |
| `sort` | string | `event_date\|created_at` — default: `event_date` |
| `order` | string | `asc\|desc` — default: `asc` |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Coldplay World Tour Hà Nội",
        "category": "music",
        "venue": "Sân vận động Mỹ Đình",
        "event_date": "2026-06-15T19:00:00Z",
        "poster_url": "https://...",
        "status": "published",
        "min_price": 500000,       // giá thấp nhất từ seat_zones
        "max_price": 2000000,      // giá cao nhất từ seat_zones
        "available_seats": 1200,   // tổng ghế còn available
        "total_seats": 5000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 48,
      "total_pages": 4
    }
  }
}
```

---

### GET `/api/events/:id`
> Public

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Coldplay World Tour Hà Nội",
    "description": "...",
    "category": "music",
    "venue": "Sân vận động Mỹ Đình",
    "event_date": "2026-06-15T19:00:00Z",
    "poster_url": "https://...",
    "status": "published",
    "created_by": 1,
    "created_at": "2026-04-01T00:00:00Z",
    "seat_zones": [
      {
        "id": 1,
        "name": "VIP",
        "price": 2000000,
        "color": "#FFD700",
        "total_rows": 5,
        "total_cols": 20,
        "available_seats": 80,
        "total_seats": 100
      }
    ],
    "average_rating": 4.5,       // null nếu chưa có review
    "review_count": 128
  }
}
```

**Errors:** `404 EVENT_NOT_FOUND`

---

### POST `/api/events`
> Admin only

**Request body:**
```json
{
  "title": "Coldplay World Tour Hà Nội",
  "description": "...",
  "category": "music",
  "venue": "Sân vận động Mỹ Đình",
  "event_date": "2026-06-15T19:00:00Z",
  "poster_url": "https://..."
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { /* event object, status: "draft" */ },
  "message": "Tạo sự kiện thành công"
}
```

---

### PUT `/api/events/:id`
> Admin only | Chỉ khi status = "draft"

**Request body:** (tất cả optional — chỉ gửi fields cần sửa)
```json
{
  "title": "...",
  "description": "...",
  "category": "sports",
  "venue": "...",
  "event_date": "2026-07-01T18:00:00Z",
  "poster_url": "..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { /* updated event object */ },
  "message": "Cập nhật sự kiện thành công"
}
```

**Errors:** `403 FORBIDDEN` | `404 EVENT_NOT_FOUND` | `409 EVENT_NOT_EDITABLE`

---

### PATCH `/api/events/:id/status`
> Admin only

**Request body:**
```json
{
  "status": "published"    // "published" | "cancelled" | "completed"
}
```

**Workflow hợp lệ:** `draft → published → completed | cancelled`

**Response 200:**
```json
{
  "success": true,
  "data": { "id": 1, "status": "published" },
  "message": "Đã xuất bản sự kiện"
}
```

**Errors:** `409 INVALID_STATUS_TRANSITION`

---

## Seat Zones — `/api/events/:eventId/seat-zones`

### GET `/api/events/:eventId/seat-zones`
> Public

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "event_id": 1,
      "name": "VIP",
      "price": 2000000,
      "color": "#FFD700",
      "total_rows": 5,
      "total_cols": 20,
      "available_seats": 80,
      "total_seats": 100
    }
  ]
}
```

---

### POST `/api/events/:eventId/seat-zones`
> Admin only

**Request body:**
```json
{
  "name": "VIP",
  "price": 2000000,
  "color": "#FFD700",
  "total_rows": 5,
  "total_cols": 20
}
```

> **Side effect:** Tự động tạo `total_rows × total_cols` rows trong bảng `seats` với row_label (A, B, C…) và col_number (1, 2, 3…).

**Response 201:**
```json
{
  "success": true,
  "data": { /* seat_zone object */ },
  "message": "Tạo khu vực và 100 ghế thành công"
}
```

---

### PUT `/api/seat-zones/:id`
> Admin only | Chỉ khi event status = "draft"

**Request body:** (tất cả optional)
```json
{
  "name": "VIP Gold",
  "price": 2500000,
  "color": "#FFA500"
}
```

**Response 200:** `{ "success": true, "data": { /* updated zone */ } }`

---

### DELETE `/api/seat-zones/:id`
> Admin only | Chỉ khi event status = "draft"

**Response 200:** `{ "success": true, "message": "Xóa khu vực thành công" }`

---

## Seats — `/api/events/:eventId/seats`

### GET `/api/events/:eventId/seats`
> Public

**Query params:**
| Param | Type | Mô tả |
|-------|------|-------|
| `zone_id` | number | Filter theo zone (optional) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "zone_id": 1,
      "zone_name": "VIP",
      "zone_color": "#FFD700",
      "zone_price": 2000000,
      "row_label": "A",
      "col_number": 1,
      "status": "available"    // "available" | "locked" | "sold"
      // KHÔNG trả về locked_by, locked_at — thông tin nhạy cảm
    }
  ]
}
```

---

## Bookings — `/api/bookings`

### POST `/api/bookings`
> Authenticated (customer)

**Request body:**
```json
{
  "event_id": 1,
  "seat_ids": [101, 102, 103],
  "promo_code": "SUMMER2026"    // optional
}
```

**Logic:**
1. Dùng DB Transaction + `SELECT ... FOR UPDATE` (row lock) để check ghế còn available
2. Nếu bất kỳ ghế nào đã `locked` hoặc `sold` → rollback, trả `409 SEATS_UNAVAILABLE`
3. Update `seats.status = 'locked'`, `locked_by = user_id`, `locked_at = NOW()`
4. Tạo `bookings` record với `expires_at = NOW() + 10 phút`
5. Tạo `booking_seats` records (snapshot giá)
6. Validate + áp promo code nếu có

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": 55,
    "event_id": 1,
    "seat_ids": [101, 102, 103],
    "subtotal": 6000000,
    "discount_amount": 200000,
    "total_amount": 5800000,
    "promo_code": "SUMMER2026",
    "status": "pending",
    "expires_at": "2026-04-17T10:10:00Z"
  },
  "message": "Đặt ghế thành công. Vui lòng thanh toán trong 10 phút"
}
```

**Errors:** `400 VALIDATION_ERROR` | `400 INVALID_PROMO` | `409 SEATS_UNAVAILABLE`

---

### GET `/api/bookings/my`
> Authenticated (customer)

**Query params:** `status` (optional: `pending|confirmed|cancelled`), `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 55,
        "event": { "id": 1, "title": "...", "event_date": "...", "poster_url": "..." },
        "total_amount": 5800000,
        "status": "confirmed",
        "seat_count": 3,
        "confirmed_at": "2026-04-17T10:05:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 5, "total_pages": 1 }
  }
}
```

---

### GET `/api/bookings/:id`
> Authenticated (owner hoặc admin)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 55,
    "user_id": 1,
    "event": { "id": 1, "title": "...", "venue": "...", "event_date": "..." },
    "seats": [
      { "id": 101, "zone_name": "VIP", "row_label": "A", "col_number": 5, "price": 2000000 }
    ],
    "subtotal": 6000000,
    "discount_amount": 200000,
    "total_amount": 5800000,
    "promo_code": "SUMMER2026",
    "status": "pending",
    "expires_at": "2026-04-17T10:10:00Z",
    "confirmed_at": null
  }
}
```

**Errors:** `403 FORBIDDEN` | `404 BOOKING_NOT_FOUND`

---

### POST `/api/bookings/:id/confirm`
> Authenticated (owner) | Giả lập thanh toán

**Logic:**
1. Verify booking còn `pending` và chưa hết hạn (`expires_at > NOW()`)
2. Update `bookings.status = 'confirmed'`, `confirmed_at = NOW()`
3. Update `seats.status = 'sold'` cho tất cả ghế trong booking
4. Tạo `tickets` records (mỗi ghế 1 ticket, tạo QR code)
5. Gửi email xác nhận (async, không block response)
6. Emit Socket.io `seat:status_changed` cho event room

**Response 200:**
```json
{
  "success": true,
  "data": {
    "booking_id": 55,
    "tickets": [
      { "id": 10, "seat": "A-5 (VIP)", "qr_code": "data:image/png;base64,..." }
    ]
  },
  "message": "Thanh toán thành công! Vé đã được gửi qua email"
}
```

**Errors:** `400 BOOKING_EXPIRED` | `409 BOOKING_ALREADY_CONFIRMED`

---

### POST `/api/bookings/:id/cancel`
> Authenticated (owner hoặc admin)

**Logic:**
1. Verify booking còn `pending`
2. Update `bookings.status = 'cancelled'`
3. Release ghế: `seats.status = 'available'`, `locked_by = NULL`, `locked_at = NULL`
4. Emit Socket.io `seat:status_changed`

**Response 200:**
```json
{ "success": true, "message": "Đã hủy đặt vé. Ghế đã được trả lại" }
```

**Errors:** `409 BOOKING_NOT_CANCELLABLE`

---

## Tickets — `/api/tickets`

### GET `/api/tickets/my`
> Authenticated (customer)

**Query params:** `status` (optional: `active|used|cancelled`), `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 10,
        "event": { "id": 1, "title": "...", "venue": "...", "event_date": "..." },
        "seat": { "zone_name": "VIP", "row_label": "A", "col_number": 5 },
        "status": "active",
        "checked_in_at": null,
        "created_at": "2026-04-17T10:05:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 3, "total_pages": 1 }
  }
}
```

---

### GET `/api/tickets/:id`
> Authenticated (owner hoặc admin)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "booking_id": 55,
    "event": {
      "id": 1,
      "title": "Coldplay World Tour Hà Nội",
      "venue": "Sân vận động Mỹ Đình",
      "event_date": "2026-06-15T19:00:00Z"
    },
    "seat": { "zone_name": "VIP", "row_label": "A", "col_number": 5, "price": 2000000 },
    "holder": { "full_name": "Nguyễn Văn A", "email": "..." },
    "qr_code": "data:image/png;base64,...",
    "status": "active",
    "checked_in_at": null
  }
}
```

---

### POST `/api/tickets/:id/check-in`
> Admin only (Staff)

**Logic:**
1. Verify ticket `status = 'active'`
2. Verify event chưa qua (event_date còn trong tương lai hoặc hôm nay)
3. Update `tickets.status = 'used'`, `checked_in_at = NOW()`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "ticket_id": 10,
    "holder": "Nguyễn Văn A",
    "event": "Coldplay World Tour Hà Nội",
    "seat": "VIP - A5",
    "checked_in_at": "2026-06-15T18:45:00Z"
  },
  "message": "Soát vé thành công"
}
```

**Errors:** `400 TICKET_ALREADY_USED` | `400 TICKET_CANCELLED` | `404 TICKET_NOT_FOUND`

---

## Promo Codes — `/api/promo-codes`

### GET `/api/promo-codes`
> Admin only

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "SUMMER2026",
      "discount_type": "percent",
      "discount_value": 10,
      "max_uses": 100,
      "used_count": 23,
      "event_id": null,
      "min_amount": 1000000,
      "starts_at": "2026-04-01T00:00:00Z",
      "expires_at": "2026-04-30T23:59:59Z",
      "is_active": true
    }
  ]
}
```

---

### POST `/api/promo-codes`
> Admin only

**Request body:**
```json
{
  "code": "SUMMER2026",
  "discount_type": "percent",       // "percent" | "fixed"
  "discount_value": 10,             // 10% hoặc 10000 VND
  "max_uses": 100,                  // null = không giới hạn
  "event_id": null,                 // null = toàn hệ thống
  "min_amount": 1000000,
  "starts_at": "2026-04-01T00:00:00Z",
  "expires_at": "2026-04-30T23:59:59Z"
}
```

**Response 201:** `{ "success": true, "data": { /* promo_code object */ } }`

**Errors:** `409 CODE_ALREADY_EXISTS`

---

### PUT `/api/promo-codes/:id`
> Admin only

**Request body:** (tất cả optional — chỉ gửi fields cần sửa)

**Response 200:** `{ "success": true, "data": { /* updated promo_code */ } }`

---

### DELETE `/api/promo-codes/:id`
> Admin only

**Response 200:** `{ "success": true, "message": "Đã xóa mã giảm giá" }`

---

### POST `/api/promo-codes/validate`
> Authenticated (customer)

> Dùng khi customer nhập mã trong booking flow để xem trước số tiền giảm. **KHÔNG** xác nhận dùng mã.

**Request body:**
```json
{
  "code": "SUMMER2026",
  "event_id": 1,
  "amount": 6000000
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "code": "SUMMER2026",
    "discount_type": "percent",
    "discount_value": 10,
    "discount_amount": 600000,
    "final_amount": 5400000
  }
}
```

**Errors:** `400 INVALID_PROMO` | `400 PROMO_EXPIRED` | `400 MIN_AMOUNT_NOT_MET` | `400 MAX_USES_REACHED`

---

## Reviews — `/api/events/:eventId/reviews`

### GET `/api/events/:eventId/reviews`
> Public

**Query params:** `page`, `limit` (default: 10)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "user": { "id": 2, "full_name": "Nguyễn Thị B" },
        "rating": 5,
        "comment": "Sự kiện tuyệt vời!",
        "created_at": "2026-04-17T00:00:00Z"
      }
    ],
    "summary": { "average_rating": 4.5, "total": 128 },
    "pagination": { "page": 1, "limit": 10, "total": 128, "total_pages": 13 }
  }
}
```

---

### POST `/api/events/:eventId/reviews`
> Authenticated (customer)

**Validate:**
- User đã có ticket `active` hoặc `used` cho event này
- Event phải có `status = 'completed'`
- Chưa review event này (unique constraint `user_id + event_id`)

**Request body:**
```json
{
  "rating": 5,
  "comment": "Sự kiện tuyệt vời!"    // optional, max 1000 chars
}
```

**Response 201:**
```json
{
  "success": true,
  "data": { /* review object */ },
  "message": "Cảm ơn bạn đã đánh giá!"
}
```

**Errors:** `403 NOT_PURCHASED` | `403 EVENT_NOT_COMPLETED` | `409 ALREADY_REVIEWED`

---

### DELETE `/api/reviews/:id`
> Authenticated (owner)

**Response 200:** `{ "success": true, "message": "Đã xóa đánh giá" }`

**Errors:** `403 FORBIDDEN` | `404 REVIEW_NOT_FOUND`

---

## Admin Dashboard — `/api/admin`

> Tất cả endpoints admin only.

### GET `/api/admin/dashboard`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 125000000,
    "total_bookings": 350,
    "total_tickets_sold": 892,
    "total_events": 12,
    "events_by_status": {
      "draft": 2,
      "published": 5,
      "completed": 4,
      "cancelled": 1
    },
    "revenue_by_month": [
      { "month": "2026-04", "revenue": 45000000 },
      { "month": "2026-03", "revenue": 80000000 }
    ],
    "top_events": [
      { "id": 1, "title": "...", "revenue": 50000000, "tickets_sold": 400, "fill_rate": 0.8 }
    ]
  }
}
```

---

### GET `/api/admin/audience`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "gender_distribution": {
      "male": 420,
      "female": 380,
      "other": 50,
      "unknown": 42
    },
    "age_distribution": [
      { "range": "18-24", "count": 280 },
      { "range": "25-34", "count": 350 },
      { "range": "35-44", "count": 180 },
      { "range": "45+", "count": 82 }
    ]
  }
}
```

---

## Chatbot — `/api/chatbot`

### POST `/api/chatbot/message`
> Public (optional auth để personalize)

**Request body:**
```json
{
  "message": "Mua vé Coldplay ở đâu?",
  "history": [                          // optional: 5 turns gần nhất
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reply": "Bạn có thể mua vé Coldplay tại trang sự kiện...",
    "suggested_events": [              // optional: nếu context liên quan đến event cụ thể
      { "id": 1, "title": "...", "event_date": "..." }
    ]
  }
}
```

---

## Socket.io Events

> Server phát (emit to) room `event:{eventId}` khi có thay đổi ghế.

### Server → Client

| Event | Payload | Khi nào |
|-------|---------|---------|
| `seat:status_changed` | `{ seat_id: number, status: 'available'\|'locked'\|'sold' }[]` | Khi lock/unlock/confirm/cancel/release ghế |

### Client → Server

| Event | Payload | Mô tả |
|-------|---------|-------|
| `join:event` | `{ event_id: number }` | Khi vào trang seat map |
| `leave:event` | `{ event_id: number }` | Khi rời trang seat map |

---

## Error Codes (chuẩn hoá)

| Code | HTTP | Mô tả |
|------|------|-------|
| `VALIDATION_ERROR` | 400 | Input không hợp lệ |
| `INVALID_CREDENTIALS` | 401 | Sai email/password |
| `UNAUTHORIZED` | 401 | Token hết hạn / không có token |
| `FORBIDDEN` | 403 | Không đủ quyền |
| `NOT_FOUND` | 404 | Resource không tồn tại |
| `CONFLICT` | 409 | Conflict (email trùng, đã review...) |
| `EMAIL_TAKEN` | 409 | Email đã đăng ký |
| `SEATS_UNAVAILABLE` | 409 | Ghế đã bị người khác giữ/mua |
| `BOOKING_EXPIRED` | 400 | Hết 10 phút, huỷ tự động |
| `BOOKING_NOT_CANCELLABLE` | 409 | Đã confirm hoặc đã cancelled |
| `BOOKING_ALREADY_CONFIRMED` | 409 | Booking đã thanh toán rồi |
| `INVALID_PROMO` | 400 | Mã không tồn tại / chưa active |
| `PROMO_EXPIRED` | 400 | Mã hết hạn |
| `MIN_AMOUNT_NOT_MET` | 400 | Đơn chưa đạt tối thiểu |
| `MAX_USES_REACHED` | 400 | Mã đã hết lượt |
| `NOT_PURCHASED` | 403 | Chưa mua vé sự kiện này |
| `EVENT_NOT_COMPLETED` | 403 | Sự kiện chưa kết thúc |
| `ALREADY_REVIEWED` | 409 | Đã review sự kiện này |
| `TICKET_ALREADY_USED` | 400 | Vé đã soát |
| `TICKET_CANCELLED` | 400 | Vé đã bị huỷ |
| `INVALID_STATUS_TRANSITION` | 409 | Chuyển trạng thái không hợp lệ |
| `CODE_ALREADY_EXISTS` | 409 | Mã promo đã tồn tại |
| `EVENT_NOT_EDITABLE` | 409 | Event không còn ở trạng thái draft |
| `WRONG_PASSWORD` | 401 | Sai mật khẩu hiện tại |
| `INTERNAL_ERROR` | 500 | Lỗi server không xác định |
