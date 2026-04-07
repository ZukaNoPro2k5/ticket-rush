# TicketRush — Copilot Instructions

## Project
TicketRush is an event ticket booking platform built for the INT3306 course.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: MySQL 8.0 via `mysql2` (raw prepared statements, NO ORM)
- **Cache/Queue**: Redis via `ioredis`
- **Real-time**: Socket.io
- **Validation**: Zod
- **Auth**: JWT + bcryptjs
- **State**: Zustand (frontend)
- **Containerized**: Docker Compose

## Coding Conventions
- Use **TypeScript strict mode** everywhere.
- Use `async/await`, never raw `.then()` chains.
- All API responses follow `{ success, data?, message?, error? }` shape.
- Use named exports, not default exports (except Next.js pages).
- Variable/function names: `camelCase`. Types/interfaces: `PascalCase`. DB columns: `snake_case`.
- SQL: Use parameterized queries (`?` placeholders) — never string interpolation.
- Prefer early returns over deeply nested conditionals.
- Keep functions under 40 lines; extract helpers when needed.
- All user-facing text should support Vietnamese (UTF-8).
- Error handling: throw `AppError` (backend), catch at middleware level.

## Security Rules
- NEVER trust client input — always validate with Zod on the backend.
- NEVER store plaintext passwords — use bcryptjs with rounds ≥ 10.
- NEVER expose internal errors to clients — return generic messages.
- SQL injection prevention: always use prepared statements.
- CORS: only allow configured origins.
- JWT: short expiry, httpOnly cookie or Authorization header.

## File Organization
- Backend modules live in `backend/src/modules/<name>/` with: `routes.ts`, `controller.ts`, `service.ts`, `validation.ts`.
- Frontend pages live in `frontend/src/app/` using Next.js App Router conventions.
- Shared UI components go in `frontend/src/components/ui/`.
- API utilities go in `frontend/src/lib/`.
