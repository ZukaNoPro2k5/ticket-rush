---
applyTo: "frontend/src/app/**,frontend/src/components/**"
---

# TicketRush Design Principles (AI MUST read before any UI work)

> This file defines the non-negotiable UX/visual rules for TicketRush. Read it fully before editing any UI code in `frontend/src/app/` or `frontend/src/components/`. If a request conflicts with these rules, surface the conflict and ask the user rather than silently breaking them.

---

## 1. Brand Tokens

### Colors (Tailwind)
- **Primary / CTA**: `amber-500` (base), `amber-600` (hover), `amber-700` (text on light), `amber-400` (on dark)
- **Ink / neutral**: `stone-*` family only. `stone-900` primary text, `stone-700` secondary, `stone-500` muted, `stone-200` borders, `stone-50` section bg, `stone-900` dark sections
- **Semantic accents** (use sparingly, one per purpose):
  - `rose-500` → HOT / almost-sold
  - `emerald-600` → new / success / positive velocity
  - `sky-500` → news / informational
  - `purple-600` → special / featured
  - `orange-600` → urgent (≥80% sold)
- **Never use**: blue-500, indigo, teal, pink, red-500 (replaced by rose). No gradients outside hero/mesh-warm.

### Shadows, Radius, Borders
- Cards: `rounded-2xl shadow-soft` (default) → `shadow-lift` (hover)
- Pills / badges: `rounded-full`
- Dropdowns / popovers: `rounded-2xl border border-stone-200 shadow-lift`
- Inputs: `rounded-xl` or `rounded-full` (pill inputs in navbar)
- **Do not** use `rounded-md` or `rounded-lg` for primary cards — reserve for compact UI only.

### Motion Easing
- `EASE_OUT_EXPO = [0.22, 1, 0.36, 1]` — the only curve for UI feedback and entrances.
- Spring physics (hover / tap): `{ type: 'spring', stiffness: 340, damping: 22 }`.

---

## 2. Typography

- **Display** (headings, prices, rank numbers): `font-display` (Be Vietnam Pro 700).
- **Body**: system default (Be Vietnam Pro 400/500).
- **Section header pattern** — every major section MUST follow this rhythm:
  1. Colored pill badge with icon (e.g. `<Flame/>` + uppercase label)
  2. H2: `font-display text-2xl md:text-3xl font-bold`
  3. Subtitle: `text-sm md:text-base text-stone-500` (one line, max ~80 chars)
  4. Right-aligned "Xem tất cả" link with `ArrowRight` icon
- **Never** stack two H2s without a subtitle between them.
- All user-facing copy is Vietnamese with correct diacritics.

---

## 3. Spacing & Layout Rhythm

- Section vertical padding: `py-12 lg:py-16` (content) or `py-14` (footer). Keep consistent.
- Section gutter: `px-4 lg:px-8` inside `max-w-7xl mx-auto`.
- Grid gap: `gap-5` for cards, `gap-4` for categories, `gap-6` for trust signals.
- Between section header and content grid: `mb-6` (or `mb-8` if header is tall).
- **Never** use arbitrary `mt-7`, `py-9` — stick to Tailwind scale.

---

## 4. Motion (Framer Motion)

Use the shared variants defined at the top of `frontend/src/app/page.tsx`. Do not invent new ease curves or timings.

```tsx
fadeUp          // headers, banners
fadeIn          // light element fade
staggerContainer(0.07) // parent of grids
cardVariant     // each card in a grid
useSectionInView()     // scroll-triggered entrance hook
```

### Rules
- Scroll entrances: `useSectionInView` + `animate={inView ? 'visible' : 'hidden'}` with `once: true`.
- Cards: wrap in `motion.div variants={cardVariant}` inside a `staggerContainer` parent.
- Hover: `whileHover={{ y: -6 }}` with spring — never translate > 8px.
- Dropdowns: `AnimatePresence` + `motion.div` with `initial={{ opacity: 0, y: -8, scale: 0.97 }}`. Duration ≤ 0.2s.
- **Only animate** `opacity`, `transform` (translate/scale). Never animate `width`, `height` (except collapsible panels with `AnimatePresence` + `height: 'auto'`), `background-color`, or `box-shadow` directly — use Tailwind `transition-shadow` / `transition-colors` for those.
- Keep total motion budget per section under 700ms to first rest.

### CSS + transform conflict (CRITICAL)
If an element uses `-translate-x-1/2` for centering, **do not** apply a CSS keyframe animation that overwrites `transform` — it will visually "snap" at animation end. Use Framer Motion's `x: '-50%'` in `initial/animate/exit` instead.

---

## 5. UX Priorities (USER HABIT RULES — DO NOT VIOLATE)

These are the behaviors users expect on a ticket marketplace. Violating these is a bug, not a style choice.

### 5.1 Explicit submission for search & filters
- Search inputs: **do NOT** trigger live search on each keystroke. Search runs ONLY on:
  - `Enter` key, OR
  - click of the submit button (magnifier inside input / "Tìm kiếm" button)
- Filter panels (categories, price, date, city, sort): changes are staged locally. A persistent **"Áp dụng"** CTA commits them to URL/query state. Show a "N thay đổi chưa áp dụng" hint when staged changes exist.
- "Xóa bộ lọc" / "Reset" must restore defaults without applying automatically.

### 5.2 Single-select where dimensions are exclusive
- **Single-select (radio-like)**: category, sort, time-window, city. A concert can't simultaneously be a workshop. Clicking a new option REPLACES the previous one.
- **Multi-select OK**: price range (if using checkbox of brackets — still staged until Apply), "có khuyến mãi" / "còn vé" toggles, tags that are ADDITIVE.
- **When a user seems to need multi-category**: offer a "Đa ngành" / "Combo" meta-tag instead of allowing incompatible combinations.

### 5.3 Scannability
- Primary info (title, price, date) ≥ 14px. Secondary info ≤ 12px with `text-stone-500`.
- Every card has: poster → badge (top-left) → title → venue → date/time → sold progress.
- Never hide critical info behind hover — hover only enhances, never reveals required facts.

### 5.4 Affordance & feedback
- Every clickable element needs a hover state: shadow-lift, `-translate-y-0.5` or `-1`, or color shift on text.
- Active tab / selected filter: `bg-stone-900 text-white` OR `bg-amber-500 text-white`. Never just border change.
- Loading states: skeleton with `animate-pulse bg-stone-200`. No spinners for content > 200ms.

### 5.5 Predictability
- Popovers anchor to their trigger and stay within viewport (use `max-w-[calc(100vw-2rem)]`).
- Animations: UI feedback ≤ 300ms, section entrances ≤ 700ms.
- Never reflow layout after initial paint (reserve `min-h` on cards, `aspect-[4/3]` on images).

---

## 6. Accessibility (VN audience)

- `aria-label` in Vietnamese on icon-only buttons ("Đóng", "Slide sau", "Tìm kiếm sự kiện").
- Focus ring must be visible (Tailwind default `focus:ring-2 focus:ring-amber-500` or custom, never `outline-none` without replacement).
- Keyboard: `Escape` closes dropdowns/modals. `Enter` submits forms. `Tab` order matches visual order.
- Do not convey meaning by color alone — always pair with icon or text ("SẮP CHÁY VÉ" text, not just orange bar).
- Contrast: white-on-amber-500 passes, white-on-amber-400 fails on text — use amber-500+ for text bg.

---

## 7. Vietnamese UX Copy Conventions

- Currency: `formatVnd()` from `lib/mockHomeData.ts` → "1.500.000 ₫".
- Date: `"Thứ Bảy, 26/04"` (weekday + dd/MM) for upcoming; `"26/04/2026"` for distant.
- Time: `"19:30 - 22:00"`.
- Buttons: verbs in imperative — "Đặt vé ngay", "Áp dụng", "Xem tất cả", "Đăng nhập".
- Empty states: friendly one-liner + suggested next action ("Không có sự kiện nào phù hợp. Thử bỏ bớt bộ lọc?").

---

## 8. Component Placement Priority

On any list/filter page, the hierarchy from top is:
1. Navbar (fixed, transparent over hero only)
2. Page header (breadcrumb → H1 with match count → subtitle)
3. Sticky filter/sort bar (with Apply CTA)
4. Result grid (cards with stagger entrance)
5. Pagination / "Xem thêm"

On the homepage, order is fixed: Hero → Categories → Sắp diễn ra → Leaderboard → For You → Mới mở bán → Tin tức → Trust → Footer.

---

## 9. Before Making Any UI Change

1. **Read this file.**
2. Check `mockHomeData.ts` / existing types for data shape.
3. Reuse shared motion variants (`fadeUp`, `cardVariant`, etc.) — do not redefine.
4. Match the section header pattern (§2).
5. Match the spacing rhythm (§3).
6. If introducing a new interactive pattern, document it here with a short note.

---

## 10. Anti-patterns — REJECT ON SIGHT

- Live-search that fires on every keystroke (breaks §5.1).
- Multi-select categories for mutually exclusive topics (breaks §5.2).
- Filter that applies instantly without Apply button (breaks §5.1).
- CSS `@keyframes` that animate `transform` on elements using `translate-x-1/2` (breaks §4).
- Blue primary, teal accent, or indigo anywhere (breaks §1).
- Animations > 700ms for section entrances, > 300ms for UI feedback.
- `rounded-md` on primary cards.
- English copy in user-facing UI.
- Missing `aria-label` on icon-only button.
- Hover state that only changes border color with no depth cue.
