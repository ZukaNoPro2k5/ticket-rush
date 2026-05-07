# TicketRush — Design System

## Color Palette

```
primary-600  #d97706   amber — CTAs, active states, accents
primary-500  #f59e0b   amber lighter — hover, highlights
primary-50   #fffbeb   amber tint — tag backgrounds

ink-900      #1c1917   primary text (warm near-black)
ink-700      #44403c   secondary text
ink-500      #78716c   muted text, labels
ink-300      #a8a29e   placeholder, disabled

surface-50   #fafaf9   page background
surface-100  #f5f5f4   card background alt
surface-200  #e7e5e4   subtle divider bg

line-200     #e7e5e4   border default
line-300     #d6d3d1   border strong

white        #ffffff   card surfaces
```

**Color strategy: Restrained** — warm stone neutrals + amber accent ≤10%. Admin pages especially subdued.

## Typography

**Body font**: Be Vietnam Pro (--font-be-vietnam-pro), `font-sans`
**Display font**: Plus Jakarta Sans (--font-jakarta), `font-display` / `font-display`

Scale in use:
```
text-xs      12px  — tags, metadata, timestamps
text-sm      14px  — table rows, secondary content, form labels
text-base    16px  — body text
text-lg      18px  — card titles, small headings
text-xl      20px  — section headings
text-2xl     24px  — page headings
text-3xl     30px  — hero numbers (sparingly)
```

Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
Display titles: `font-display tracking-tight` with `font-bold` or `font-semibold`

## Spacing & Layout

Admin pages use a two-column shell: `sidebar (64px collapsed / 240px expanded)` + `main content`.
Content max-width: `max-w-7xl mx-auto px-6`.
Section gap: `gap-6` or `gap-8` between major blocks.

## Components

### Cards
```
rounded-2xl border border-stone-200 bg-white p-5 shadow-soft
```
No nested cards. No side-stripe borders.

### Stat blocks (admin)
Icon in colored rounded-xl square → large number → small label below.
Use `rounded-xl p-2.5` for icon container with tinted bg.
**Do NOT** use gradient accents on stat cards — this is in the anti-reference list.

### Buttons
Primary: `bg-primary text-white rounded-xl px-4 py-2 font-medium hover:bg-primary-700`
Ghost: `border border-stone-200 rounded-xl px-4 py-2 text-stone-700 hover:bg-stone-50`
Danger: `bg-red-500 text-white rounded-xl px-4 py-2`

### Badges / Tags
```
inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium
```
Colors: active=`bg-emerald-50 text-emerald-700`, expired=`bg-stone-100 text-stone-500`,
scheduled=`bg-amber-50 text-amber-700`, error=`bg-red-50 text-red-600`

### Tables
Header: `text-xs font-semibold uppercase tracking-wide text-stone-500`
Row: `border-t border-stone-100 py-3 text-sm text-stone-700`
Hover: `hover:bg-stone-50/60 transition-colors`

### Inputs & Forms
```
rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm
focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
```

### Empty states
Centered icon (stone-300) + heading (stone-700) + description (stone-400) + optional CTA.
No illustrations, no complex SVGs — keep it clean.

## Motion

Library: Framer Motion (`motion` from 'framer-motion').
Shared variants in `lib/motion.ts`:
```ts
fadeUp: { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }
```
Use `initial="hidden" animate="visible"` pattern.
List items: `staggerChildren: 0.05` in parent.
No bounce, no elastic, no spring on layout transitions.

## Shadows

```
shadow-soft   0 4px 20px -4px rgba(28,25,23,0.08)   — default card
shadow-lift   0 12px 32px -8px rgba(28,25,23,0.18)  — hover/modal
```

## Admin Shell (layout pattern)

Sidebar: dark stone (`bg-ink-900` / `bg-stone-900`), white icons, amber active indicator.
Main area: `bg-surface-50` / `bg-stone-50`.
Top of content area: page title (text-2xl font-display font-bold) + optional action button (right-aligned).

## Icons

lucide-react throughout. Size: `h-4 w-4` inline, `h-5 w-5` card icons, `h-8 w-8` empty states.
