# TicketRush — Hướng dẫn đội nhóm

> **Môn học:** INT3306 · **Nhóm gồm:** Leader (A), Backend+Frontend (B), Admin+Support (C)
> File này dành cho **cả người và AI** đọc. GitHub Copilot tự load `.github/instructions/*.md`, file này bổ sung context tổng thể.

---

## 1. Bắt đầu nhanh

```bash
# 1. Clone repo
git clone <repo-url> && cd ticket-rush

# 2. Copy biến môi trường
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# 3. Khởi động toàn bộ stack
docker compose up --build

# 4. Seed dữ liệu (chỉ lần đầu — tự động chạy qua docker/init-db.sh)
# Nếu cần reset: docker compose down -v && docker compose up --build
```

Sau khi khởi động:
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| MySQL | localhost:3306 |
| Redis | localhost:6379 |

---

## 2. Kiến trúc tổng thể

```
ticket-rush/
├── backend/src/
│   ├── modules/<tên>/       ← routes · controller · service · validation
│   ├── middleware/           ← auth · errorHandler · validate
│   ├── config/               ← database · redis · env · socket
│   └── shared/               ← AppError · asyncHandler · response
│
├── frontend/src/
│   ├── app/                  ← Next.js route shells (page.tsx per route)
│   ├── components/           ← UI thuần (không fetch, không store)
│   │   ├── home/             ← Homepage sections
│   │   ├── event-detail/     ← Event detail sections
│   │   ├── events/           ← Browse/filter components
│   │   ├── layout/           ← Navbar (6 sub-components), footer
│   │   ├── providers/        ← Providers.tsx, ProtectedRoute.tsx
│   │   └── ui/               ← Shared: Button · Card · Modal · Input · Badge
│   ├── data/                 ← Static UI config (không fetch)
│   │   ├── uiConfig.ts       ← HERO_SLIDES, THIS_WEEK_EVENTS, CATEGORIES, STATS...
│   │   ├── promotions.ts     ← PROMOTIONS (static)
│   │   └── eventDetailData.ts← FAQ, lineup, zone data cho detail page
│   ├── lib/
│   │   ├── api/              ← client.ts (axios + JWT), events.ts, index.ts
│   │   ├── utils/            ← cn, seatUtils, eventMappers, eventsFilters, index.ts
│   │   ├── motion.ts         ← Shared Framer Motion tokens (EASE_OUT_EXPO, spring)
│   │   └── socket.ts         ← Socket.io client
│   ├── stores/               ← useAuthStore, useUIStore (Zustand)
│   └── types/index.ts        ← Tất cả TypeScript interfaces (DisplayEvent, Event...)
│
└── database/
    ├── migrations/           ← 001–010: SQL schema files (chạy theo thứ tự)
    └── seeds/001_seed_data.sql
```

---

## 3. Phân công nhân sự

| Người | Vai trò | Task chính |
|-------|---------|------------|
| **A (Leader)** | Engine & Infra | Auth, Booking engine, Seat locking, Cronjob, Socket.io, DB, Git review |
| **B** | Customer Journey | Events CRUD, Seat zones, Tickets/QR, Browse/Detail pages, Responsive |
| **C** | Admin & Support | Admin dashboard, Promo codes, Reviews, Users, Auth pages, Check-in |

Chi tiết task xem [docs/plan.md](docs/plan.md).

---

## 4. Quy tắc code

### Backend (Express + TypeScript)
- Module pattern: mỗi feature = `routes.ts` + `controller.ts` + `service.ts` + `validation.ts`
- Controller chỉ xử lý HTTP — logic nằm trong service
- SQL: **luôn** dùng `?` placeholder, **không bao giờ** nối chuỗi
- Validate input bằng Zod trước khi vào controller
- Throw `AppError` cho lỗi dự kiến (404, 400, 403)
- Wrap async handler với `asyncHandler()`
- Response format: `{ success, data?, message?, error? }`

> Chi tiết: [.github/instructions/backend.instructions.md](.github/instructions/backend.instructions.md)

### Frontend (Next.js 14 + TypeScript + Tailwind)
- `app/` = route shells only — không chứa logic lớn
- `components/` = UI thuần (không fetch trực tiếp, dùng props)
- Import types từ `@/types` — không re-export từ `@/data/uiConfig`
- Static UI data từ `@/data/uiConfig` hoặc `@/data/promotions`
- API calls từ `@/lib/api/events` (không dùng fetch raw)
- State toàn cục: Zustand (`useAuthStore`, `useUIStore`)

> Chi tiết: [.github/instructions/frontend.instructions.md](.github/instructions/frontend.instructions.md)

### Design (Tailwind + Framer Motion)
- Màu chính: `amber-500/600` (CTA), `stone-*` (neutral), `rose-500` (HOT), `emerald-600` (new)
- **Không dùng**: `blue-500`, `indigo`, `teal`, `pink`, `red-500`
- Card: `rounded-2xl shadow-soft` → hover `shadow-lift`
- Motion easing: `EASE_OUT_EXPO = [0.22, 1, 0.36, 1]` (import từ `@/lib/motion`)
- Section header pattern: pill badge → H2 → subtitle → "Xem tất cả" link

> Chi tiết: [.github/instructions/design-principles.instructions.md](.github/instructions/design-principles.instructions.md)

---

## 5. Git workflow

```
main         ← production (stable)
  └── develop ← integration (mọi feature merge vào đây)
        ├── feature/A-bookings
        ├── feature/B-events
        └── feature/C-admin
```

```bash
# Tạo branch mới
git checkout -b feature/<tên-task> develop

# Commit
git commit -m "feat: mô tả ngắn"   # feat | fix | chore | docs | refactor

# Push + tạo PR vào develop
git push origin feature/<tên-task>
```

**Quy tắc:**
- Checkout **từ `develop`**, merge **vào `develop`** (không merge thẳng vào `main`)
- **A review và merge** tất cả PR
- Commit message: `feat:` tính năng mới | `fix:` sửa bug | `chore:` setup/config | `docs:` tài liệu

---

## 6. Database

**9 bảng chính:** `users` → `events` → `seat_zones` → `seats` → `promo_codes` → `bookings` → `booking_seats` → `tickets` → `reviews`

Migration 010 thêm vào bảng `users`: `oauth_provider`, `oauth_provider_id`, `category_preferences` (JSON), `preferred_city`.

> Sơ đồ trực quan: paste nội dung [docs/dbdiagram.dbml](docs/dbdiagram.dbml) vào [dbdiagram.io](https://dbdiagram.io)

---

## 7. Biến môi trường

```bash
# Backend (.env)
PORT=4000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=ticketrush
DB_USER=ticketrush_user
DB_PASSWORD=...
JWT_SECRET=...
REDIS_URL=redis://redis:6379
FRONTEND_URL=http://localhost:3000

# Frontend (frontend/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

Mẫu đầy đủ: [.env.example](.env.example) và [frontend/.env.local.example](frontend/.env.local.example)

---

## 8. Seed data có sẵn

| Email | Mật khẩu | Role |
|-------|----------|------|
| `admin@ticketrush.vn` | `admin123` | admin |
| `nguyen.van.a@gmail.com` | `password123` | customer |
| `tran.thi.b@gmail.com` | `password123` | customer |
| `le.van.c@gmail.com` | `password123` | customer |
| `pham.thi.d@gmail.com` | `password123` | customer |

20 sự kiện thật từ TicketBox.vn (nhạc, sân khấu, thể thao, workshop). Ghế đã tạo cho EXO và IDECAF.

---

## 9. Tài liệu tham khảo

| File | Nội dung |
|------|----------|
| [docs/api-spec.md](docs/api-spec.md) | API đầy đủ (request/response format, error codes) |
| [docs/dbdiagram.dbml](docs/dbdiagram.dbml) | Schema DB dạng DBML |
| [docs/plan.md](docs/plan.md) | Kế hoạch phases, phân công task chi tiết |
| [docs/features-and-usecases.md](docs/features-and-usecases.md) | Use cases, luồng nghiệp vụ |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Copilot tổng quát |
