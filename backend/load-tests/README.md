# TicketRush — Load tests

## Cài k6

```bash
# Ubuntu/Debian
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

## Chuẩn bị

1. Bật backend: `npm run dev` ở `backend/`
2. Tạo user test trong DB:
   ```sql
   INSERT INTO users (email, password_hash, full_name, role, is_active)
   VALUES ('test+loadk6@ticketrush.local',
           '$2a$10$<bcrypt_hash_of_Test12345!>',
           'Load Tester', 'customer', 1);
   ```
3. Đảm bảo có 1 event published với nhiều ghế available, ghi nhớ `event_id`.

## Chạy

```bash
# Default: event_id=1, 100 VU peak, ~3 phút
k6 run booking-flow.js

# Custom
EVENT_ID=5 API_URL=http://localhost:4000/api k6 run booking-flow.js

# Output detail JSON
k6 run --out json=results.json booking-flow.js

# Cloud dashboard (cần account k6 cloud)
k6 cloud booking-flow.js
```

## Đọc kết quả

- **`http_req_duration` p(95)** — latency tổng. Threshold đặt < 800ms.
- **`booking_create_duration` p(95)** — riêng POST /bookings (đường dẫn nóng nhất). < 1000ms.
- **`seat_conflicts_409`** — số lần Redis lock từ chối. Bình thường có dưới load cao, không phải bug.
- **`successful_bookings`** — đếm các booking confirm xong, dùng để tính throughput.
- **`http_req_failed`** rate — phải < 5% (loại trừ 409 dự kiến).

## Benchmark trước/sau optimize

```bash
# Lưu baseline trước khi apply DB indexes
k6 run --summary-export=before.json booking-flow.js

# Apply migration 010 → restart backend → đo lại
k6 run --summary-export=after.json booking-flow.js

# So sánh thủ công 2 file JSON, hoặc xem terminal summary cuối mỗi run.
```
