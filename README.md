# TicketRush

TicketRush is a full-stack event ticketing platform built for fast customer booking flows and operational control during high-demand sales. The project combines realtime seat state, booking expiration, QR tickets, virtual queue support, customer engagement features, and an admin workspace in one repository.

The product is designed for the Vietnamese event market. The customer frontend now supports Vietnamese and English UI switching for the main user journey while dynamic event, post, and admin-managed content continues to come from the backend data source.

## Highlights

### Customer experience

- Browse published events with search, category, time, city, price, and sorting filters.
- View event details, ticket zones, seat availability, and realtime seat changes.
- Hold seats during checkout, apply promotion codes, confirm bookings, and receive QR tickets.
- Save events, review order history, manage profile/security settings, and receive personalized event suggestions.
- Use email/password authentication or OAuth flows with password reset support.
- Switch the main user UI between Vietnamese and English from desktop and mobile navigation.

### Operations and admin

- Manage events, posts, promo codes, users, payments, reports, seat layouts, and system settings.
- Configure seated, zoned, and admission ticket layouts for different event formats.
- Monitor analytics, revenue summaries, fill rates, booking activity, and operational states.
- Run virtual queue logic with Redis for events that need controlled entry.
- Check in tickets from QR data and track ticket lifecycle states.

### Platform behavior

- Express API modules use validation, service boundaries, JWT auth, error handling, and consistent response envelopes.
- MySQL stores users, events, seat zones, seats, bookings, payments, tickets, posts, promo codes, and operational settings.
- Socket.IO broadcasts seat status updates to reduce stale seat maps.
- Redis supports queue and seat-hold coordination paths.
- Cron processing releases expired booking holds.
- Prometheus metrics and an API health endpoint are exposed by the backend.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, SWR, Zustand |
| Backend | Node.js, Express, TypeScript, Zod, JWT, Socket.IO |
| Data | MySQL 8, Prisma Client, SQL migrations and seed scripts |
| Coordination | Redis, cron jobs |
| Delivery | Docker Compose, separate frontend/backend Dockerfiles |
| Integrations | NextAuth OAuth, Nodemailer email flow, optional Gemini-backed admin reporting |

## Repository Layout

```text
ticket-rush/
|-- backend/
|   |-- prisma/                 Prisma schema
|   |-- src/config/             Environment, Redis, Prisma, sockets, metrics
|   |-- src/middleware/         Auth, validation, idempotency, metrics, maintenance
|   `-- src/modules/            Domain modules: auth, events, bookings, tickets, admin, ...
|-- frontend/
|   |-- src/app/                Next.js routes for customer and admin surfaces
|   |-- src/components/         Layout, auth, event, seat, admin, and shared UI components
|   |-- src/lib/                API clients, socket client, i18n copy, motion, utilities
|   |-- src/stores/             Zustand auth and UI stores
|   `-- src/types/              Shared frontend TypeScript models
|-- database/
|   |-- migrations/             Ordered SQL migrations
|   `-- seeds/                  Local development seed data
|-- docker/                     Dockerfiles and database init script
`-- docs/                       API notes, use cases, schema diagrams, project plan
```

## Main Flows

### Event booking

1. A customer searches or filters published events.
2. The event detail and seat pages load backend seat/zone data.
3. Selected seats are locked for a booking window.
4. Checkout may apply a promo code before booking confirmation.
5. Confirmation marks seats sold and creates QR ticket records.
6. Expired holds are released automatically and seat updates are broadcast to connected clients.

### Admin event operation

1. An admin creates or edits event metadata.
2. Ticket zones, seat capacity, pricing, and layout patterns are configured.
3. Published events appear in the customer frontend.
4. Admin dashboards and reports summarize bookings, revenue, customer activity, and operations.

## Local Setup

### Prerequisites

- Node.js 20 or a compatible runtime for the current Next.js and TypeScript toolchain.
- npm. Bun scripts are also present at the repository root.
- Docker Desktop or Docker Engine with Docker Compose for the easiest MySQL and Redis setup.

### Environment

Copy the root environment template before starting the backend:

```bash
cp .env.example .env
```

The root template defines database, Redis, JWT, backend, frontend, and optional Gemini values:

| Variable group | Examples |
| --- | --- |
| Database | `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| Redis | `REDIS_HOST`, `REDIS_PORT` |
| Auth | `JWT_SECRET`, `JWT_EXPIRES_IN` |
| Backend | `BACKEND_PORT`, `BACKEND_PUBLIC_URL`, `NODE_ENV` |
| Frontend | `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL` |
| Optional AI report support | `GEMINI_API_KEY`, `GEMINI_MODEL` |

Use non-demo secrets for shared or production environments.

### Option A: Docker Compose

Docker Compose starts MySQL, Redis, backend, and frontend. Database migrations and seed scripts are mounted into MySQL initialization.

```bash
docker compose up --build
```

After startup:

| Service | Address |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:4000/api` |
| Backend health | `http://localhost:4000/api/health` |
| Metrics | `http://localhost:4000/metrics` |
| MySQL | `localhost:3306` |
| Redis | `localhost:6379` |

To rebuild the local database volume and rerun initialization:

```bash
docker compose down -v
docker compose up --build
```

### Option B: Local frontend/backend processes

Start MySQL and Redis locally or with only the relevant Compose services, then install dependencies:

```bash
npm run install:all
```

Run both applications from the repository root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

The backend reads the root `.env` through `dotenv`. The frontend uses `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` values available to the Next.js runtime.

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run frontend and backend development processes together |
| `npm run build` | Build backend and frontend through the root Bun scripts |
| `npm run lint` | Run backend and frontend lint scripts |
| `npm run start` | Start built backend and frontend processes |
| `npm run db:reset` | Recreate Docker volumes and containers for a clean database |
| `npm run db:reseed` | Reload the SQL seed data into the Compose MySQL instance |
| `cd frontend && npm run build` | Validate the Next.js production bundle |
| `cd backend && npm run build` | Type-check and emit the Express backend |

## API Shape

The backend API is rooted at `/api`. Standard responses use one envelope:

```json
{
  "success": true,
  "data": {},
  "message": "optional message"
}
```

Error responses expose an error code and message:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable message"
  }
}
```

Key API groups include:

| Group | Scope |
| --- | --- |
| `/api/auth` | Register, login, OAuth sync, password reset |
| `/api/users` | Profile, password, avatar, preferences |
| `/api/events` | Published event browsing and admin event work |
| `/api/events/:eventId/seats` | Seat map state |
| `/api/bookings` | Booking create, query, lifecycle, promo application |
| `/api/tickets` | QR tickets and check-in |
| `/api/promo-codes` | Promotion code management |
| `/api/posts` | News and post browsing |
| `/api/engagement` | Favorites and customer engagement |
| `/api/admin` | Dashboard, analytics, reports, settings, operations |

See [docs/api-spec.md](docs/api-spec.md) for request and response examples.

## Database Notes

SQL migrations live in [database/migrations](database/migrations) and run in order during MySQL container initialization. The Prisma schema in [backend/prisma/schema.prisma](backend/prisma/schema.prisma) describes the current relational model used by backend services.

Core tables cover:

- Accounts and preferences: `users`, password reset records, engagement data.
- Catalog and content: `events`, `seat_zones`, `seats`, `posts`, `promo_codes`.
- Sales lifecycle: `bookings`, `booking_seats`, `payments`, `tickets`.
- Operations: admin settings, email outbox/templates, queue-related runtime data.

The seed script in [database/seeds/001_seed_data.sql](database/seeds/001_seed_data.sql) provides local demo data for development.

## Documentation

| File | Purpose |
| --- | --- |
| [docs/features-and-usecases.md](docs/features-and-usecases.md) | Actors, use cases, booking lifecycle, backend module map |
| [docs/api-spec.md](docs/api-spec.md) | API contract examples |
| [docs/dbdiagram.dbml](docs/dbdiagram.dbml) | Database diagram source |
| [docs/plan.md](docs/plan.md) | Project plan and implementation notes |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Team workflow and repository conventions |

## Current Scope

TicketRush already covers the core event booking, seat lifecycle, admin, content, and operational surfaces needed for a full project demo. Some flows remain intentionally environment-dependent:

- Payment behavior can run as a project/demo flow instead of a live external payment gateway.
- OAuth requires provider credentials and callback configuration.
- Email delivery depends on the configured mail environment.
- Gemini reporting is optional and falls back when no API key is provided.
