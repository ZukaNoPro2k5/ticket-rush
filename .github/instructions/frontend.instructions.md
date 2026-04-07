---
applyTo: "frontend/**"
---

# Frontend Instructions (Next.js 14 + TypeScript + Tailwind)

## Framework
- Next.js 14 App Router — use `app/` directory conventions.
- Server Components by default. Add `'use client'` only when using hooks, event handlers, or browser APIs.
- Use `metadata` export for SEO on page/layout files.

## Styling
- Tailwind CSS utility classes only — no custom CSS unless absolutely necessary.
- Use `cn()` helper (clsx + twMerge) for conditional class merging.
- Mobile-first responsive: `sm:`, `md:`, `lg:` breakpoints.

## State & Data
- Zustand for client state (auth, UI). Keep stores small and focused.
- `fetch` or Axios via `lib/api.ts` for API calls — always handle loading & error states.
- Socket.io client via `lib/socket.ts` for real-time seat updates.

## Components
- Reusable UI components in `components/ui/` — keep them generic, no business logic.
- Page-specific components co-located in their route folder.
- Props typed with interfaces, not `any`.

## Patterns
- All user-facing text in Vietnamese.
- Use `react-hot-toast` for notifications.
- Handle 401 responses with redirect to login (already in Axios interceptor).
