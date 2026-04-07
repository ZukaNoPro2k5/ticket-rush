---
applyTo: "backend/**"
---

# Backend Instructions (Express.js + TypeScript)

## Architecture
- Module pattern: each feature lives in `src/modules/<name>/` with `routes.ts`, `controller.ts`, `service.ts`, `validation.ts`.
- Controllers handle HTTP req/res only — delegate logic to services.
- Services contain business logic, call DB via `mysql2` pool.

## Database
- Use `mysql2/promise` pool from `config/database.ts`.
- Always use parameterized queries: `pool.execute('SELECT * FROM users WHERE id = ?', [id])`.
- NEVER use string interpolation/template literals in SQL.
- Return typed results: `const [rows] = await pool.execute<RowDataPacket[]>(...)`.

## Validation
- Validate all incoming requests with Zod schemas in `validation.ts`.
- Use `validate` middleware: `router.post('/', validate(schema), controller.create)`.

## Error Handling
- Throw `AppError` for expected errors (404, 400, 403).
- Unexpected errors are caught by `errorHandler` middleware — logged server-side, generic message sent to client.
- Wrap async route handlers with `asyncHandler()`.

## Auth
- JWT token verified via `authenticate` middleware.
- Role-based access via `authorize('admin')` middleware.
- Passwords hashed with bcryptjs (10+ rounds).

## Response Format
```typescript
{ success: boolean; data?: T; message?: string; error?: string }
```
