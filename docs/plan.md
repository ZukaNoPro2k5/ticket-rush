# TicketRush — Kế hoạch triển khai dự án

> **Môn học:** INT3306 | **Nhóm:** 3 người | **Thời gian:** ~5 tuần (~18 ngày làm việc)

---

## 1. Phân công nhân sự

| Người | Vai trò | Phụ trách chính |
|-------|---------|-----------------|
| **A (Leader)** | Engine & Infra | Auth, Booking engine, Seat locking, Cronjob, Socket.io, DB, Git |
| **B** | Customer Journey | Events CRUD, Seat zones, Tickets/QR, Email, Browse/Detail pages |
| **C** | Admin & Support | Admin dashboard, Promo codes, Reviews, Users, Chatbot, Auth pages |

---

## 2. Danh sách màn hình (17 màn)

### Customer

| URL | Màn hình | Mô tả |
|-----|----------|-------|
| `/` | Homepage | Hero carousel + 6 section sự kiện + danh mục |
| `/events` | Browse events | Filter category, search, pagination |
| `/events/[id]` | Event detail | Poster, mô tả, zone giá, reviews, CTA |
| `/events/[id]/seats` | Seat map | Grid ghế real-time, chọn ghế |
| `/events/[id]/seats` (sidebar) | Booking flow | Countdown 10 phút, promo, xác nhận |
| `/tickets` | Danh sách vé | Vé đã mua, trạng thái |
| `/tickets/[id]` | Vé chi tiết | QR code, thông tin ghế/sự kiện |
| `/login` | Đăng nhập | Email + password |
| `/register` | Đăng ký | Họ tên, email, password, SĐT |
| `/profile` | Hồ sơ cá nhân | Sửa thông tin, đổi mật khẩu |

### Admin

| URL | Màn hình | Mô tả |
|-----|----------|-------|
| `/admin` | Dashboard | Doanh thu, fill rate, biểu đồ |
| `/admin/events` | Quản lý sự kiện | List + trạng thái workflow |
| `/admin/events/new` | Tạo sự kiện | Form + config seat zones |
| `/admin/events/[id]/edit` | Sửa sự kiện | Edit + manage zones |
| `/admin/promo-codes` | Quản lý mã giảm | List + tạo/sửa |
| `/admin/audience` | Thống kê khán giả | Giới tính, tuổi, biểu đồ |

### Staff

| URL | Màn hình | Mô tả |
|-----|----------|-------|
| `/check-in` | Soát vé | Nhập mã / scan QR → check-in |

---

## 3. Danh sách đầu việc chi tiết

### A (Leader) — 15 tasks

| Task | Đầu việc | Loại |
|------|----------|------|
| A1 | DB migrations 9 bảng + seed data | SQL |
| A2 | Shared TypeScript types (User, Event, Seat, Booking...) | Types |
| A3 | Git workflow setup (develop branch, hướng dẫn team) | Infra |
| A4 | Docker Compose verify, .env mẫu | Infra |
| A5 | Module `auth` — register, login, getProfile, JWT | Backend |
| A6 | Module `seats` — xem ghế theo zone, lock/unlock ghế | Backend |
| A7 | Module `bookings` — tạo booking, confirm, cancel, áp promo | Backend |
| A8 | Cronjob auto-release ghế hết hạn 10 phút | Backend |
| A9 | Socket.io broadcast seat status changes | Backend |
| A10 | `useAuthStore` (Zustand) + protected route HOC | Frontend |
| A11 | Seat map interactive — grid ghế, màu trạng thái, click chọn | Frontend |
| A12 | Booking flow UI — sidebar countdown, promo, xác nhận | Frontend |
| A13 | Real-time seat update (Socket.io client) | Frontend |
| A14 | Virtual Queue simplified (loading khi concurrent cao) | Full-stack |
| A15 | Homepage kết nối API thật thay mock data | Frontend |

### B — 10 tasks

| Task | Đầu việc | Loại |
|------|----------|------|
| B1 | Module `events` — CRUD, list + filter/search, publish/cancel/complete | Backend |
| B2 | Module `seat-zones` — CRUD zone, auto-generate seats grid | Backend |
| B3 | Module `tickets` — generate ticket + QR code, xem vé | Backend |
| B4 | Email service (nodemailer) — gửi xác nhận + QR khi booking confirmed | Backend |
| B5 | Trang browse events `/events` — filter, search, pagination | Frontend |
| B6 | Trang event detail `/events/[id]` — poster, thông tin, zone giá, CTA | Frontend |
| B7 | Trang danh sách vé `/tickets` | Frontend |
| B8 | Trang vé chi tiết `/tickets/[id]` — QR code | Frontend |
| B9 | Responsive toàn bộ customer pages | Frontend |
| B10 | SEO metadata cho từng page | Frontend |

### C — 14 tasks

| Task | Đầu việc | Loại |
|------|----------|------|
| C1 | Module `users` — cập nhật profile, đổi mật khẩu | Backend |
| C2 | Module `promo-codes` — CRUD, validate (expiry, usage, min_amount) | Backend |
| C3 | Module `reviews` — CRUD (validate: đã mua vé + event completed) | Backend |
| C4 | Module `admin` — dashboard APIs (doanh thu, fill rate, thống kê tuổi/giới) | Backend |
| C5 | Module `chatbot` — rule-based FAQ hoặc Gemini API | Backend |
| C6 | Trang `/login` + `/register` | Frontend |
| C7 | Trang profile `/profile` | Frontend |
| C8 | Admin layout (sidebar nav) + `/admin/dashboard` (charts) | Frontend |
| C9 | Admin `/admin/events` — list + create/edit + status workflow | Frontend |
| C10 | Admin `/admin/promo-codes` — list + create/edit | Frontend |
| C11 | Admin `/admin/audience` — biểu đồ thống kê | Frontend |
| C12 | Review UI trong event detail (list reviews + form đánh giá) | Frontend |
| C13 | Check-in page `/check-in` — scan QR → check-in | Frontend |
| C14 | Error states, loading skeletons, empty states toàn app | Frontend |

---

## 4. Phân chia theo Phase

### Phase 0 — Nền móng (3 ngày) — A làm một mình

> B và C chưa code được vì chưa có DB, types, auth. Dùng thời gian này để đọc docs, làm quen codebase.

| Task | Mô tả |
|------|-------|
| A1 | 9 file migration (`001_users.sql` → `009_promo_codes.sql`) + seed data có thể test ngay |
| A2 | Shared types cho backend + frontend |
| A3 | Tạo branch `develop`, viết hướng dẫn git workflow |
| A4 | `docker compose up` chạy OK, `.env.example` |
| A5 | Module auth hoàn chỉnh (register/login/getProfile) |
| A10 | `useAuthStore` + protected route wrapper (B + C cần dùng ngay Phase 1) |

**Verify xong Phase 0:**
- `docker compose up` → tất cả 4 service xanh
- `POST /api/auth/register` + `POST /api/auth/login` thành công
- DB có seed data (1 admin, 2-3 sự kiện mẫu, ghế mẫu)

---

### Phase 1 — Backend song song (5 ngày) — Cả 3 người

| Người | Tasks | Ghi chú |
|-------|-------|---------|
| **A** | A6, A7, A8, A9 | Thứ tự: A6 (seats) trước để B test seat-zones; A7 (bookings) sau; A8+A9 cuối |
| **B** | B1, B2, B3, B4 | Thứ tự: B1 (events) trước; B2 (seat-zones) cần A6 xong; B3+B4 song song |
| **C** | C1, C2, C3, C4, C5 | Thứ tự tự do, không phụ thuộc nhau |

**Dependency quan trọng:** B2 cần A6 xong. A thông báo B khi A6 xong (ngày 2 Phase 1).

**Verify xong Phase 1:**
- Mỗi module test được bằng Postman
- Tất cả API trả đúng format `{ success, data, message }`

---

### Phase 2 — Frontend song song (5 ngày) — Cả 3 người

| Người | Tasks | Ghi chú |
|-------|-------|---------|
| **A** | A11, A12, A13 | Phần khó nhất Frontend — seat map + real-time |
| **B** | B5, B6, B7, B8 | Customer flow từ browse → detail → ticket |
| **C** | C6, C7, C8, C9, C10, C11, C12, C13 | Auth + toàn bộ Admin panel + check-in |

**Trước khi bắt đầu Phase 2:** A phải xong A10 (useAuthStore + protected route) từ Phase 0 để C dùng ngay.

**Verify xong Phase 2:**
- Navigation hoạt động đúng
- Data load từ API thật
- Không có trang trắng

---

### Phase 3 — Tích hợp & Polish (3-4 ngày) — Cả 3 người

| Người | Tasks | Mô tả |
|-------|-------|-------|
| **A** | A14, A15 | Virtual queue; homepage connect API thật |
| **B** | B9, B10 | Responsive customer pages; SEO metadata |
| **C** | C14 | Loading skeletons, empty states, error toasts toàn app |
| **Chung** | — | Integration test full flow, fix bugs, security audit, README |

**Integration test cần chạy:**
1. Register → login → browse events → chọn sự kiện
2. Vào seat map → chọn ghế → lock 10 phút → áp promo → confirm
3. Nhận vé → xem QR → staff check-in
4. Viết review sau khi sự kiện completed
5. Mở 2 browser tabs cùng lúc → test real-time seat conflict

---

## 5. Git Workflow

```
main              ← production (stable, merge từ develop sau mỗi sprint)
  └── develop     ← integration branch (mọi feature merge vào đây)
        ├── feature/A-auth
        ├── feature/A-bookings
        ├── feature/B-events
        ├── feature/C-admin
        └── ...
```

**Quy tắc:**
1. Checkout từ `develop`: `git checkout -b feature/ten-task develop`
2. Commit nhỏ, thường xuyên
3. Xong task → tạo Pull Request vào `develop`
4. **A (Leader) review và merge** tất cả PR
5. Không push thẳng lên `develop` hoặc `main`
6. Mỗi tuần merge `develop` → `main` nếu stable

---

## 6. Quy ước code

> Xem chi tiết tại `.github/copilot-instructions.md` và `.github/instructions/`

- **TypeScript strict** toàn bộ
- **Backend:** module pattern — `routes.ts` + `controller.ts` + `service.ts` + `validation.ts`
- **SQL:** chỉ dùng parameterized queries (`?` placeholder), không string interpolation
- **API response:** luôn trả `{ success, data?, message?, error? }`
- **Error:** throw `AppError`, xử lý ở middleware
- **Frontend:** Tailwind CSS only, `cn()` cho conditional classes
- **Naming:** `camelCase` biến/hàm, `PascalCase` types, `snake_case` DB columns
- **Commits:** `feat:`, `fix:`, `chore:` prefix

---

## 7. Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| State | Zustand |
| Real-time | Socket.io client |
| Backend | Express.js + TypeScript |
| Database | MySQL 8.0 (raw mysql2, không ORM) |
| Cache/Queue | Redis (ioredis) |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Email | nodemailer |
| QR Code | qrcode |
| Containers | Docker Compose |

---

## 8. Tổng kết effort

| Người | Số tasks | Ước effort |
|-------|----------|------------|
| A (Leader) | 15 | ~34 điểm |
| B | 10 | ~30 điểm |
| C | 14 | ~33 điểm |

**Tổng thời gian:** ~18 ngày làm việc (Phase 0: 3 ngày + Phase 1: 5 ngày + Phase 2: 5 ngày + Phase 3: 3-4 ngày)
