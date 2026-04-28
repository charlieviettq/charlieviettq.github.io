# Design System — charlieviettq.github.io

> **Purpose**: Drop this file into any AI coding session to vibe-code new pages/components that are 100% on-brand. Every value below is the live source of truth from `globals.css` + the component library.

---

## 1. Visual Theme & Atmosphere

**Warm constellation portfolio** — Cursor-inspired warm minimalism fused with a personal constellation/network brand mark (Bạch Lạp Kim / Tân Tỵ 2001 palette). Two moods in one:

- **Light mode**: warm cream canvas (`#f2f1ed`) with deep warm-brown text (`#26251e`). Feels like premium paper — not cold white. Glassmorphism cards float over a living constellation canvas.
- **Dark mode**: brown-black (`#1a1814`) — deliberately NOT cold navy. Warm dark surfaces give cozy editorial quality. Constellation particles glow clearly against the deep background.

**Personality keywords**: premium data engineering · editorial warmth · subtle depth · constellation/network motif · bilingual (VI/EN)

**Key characteristics:**
- Three Google fonts: **Exo 2** (display/heading/UI), **Lora** (blog prose), **Roboto Mono** (code)
- Aggressive negative letter-spacing on headings (`-0.03em` h1, `-0.022em` h2/h3) — engineered feel
- **Gold accent** (`#C9A84C`) for all UI elements — exactly matches constellation logo node color
- **Signal orange** (`#f54e00`) reserved **only** for the primary CTA action button
- **Glassmorphism** for cards: `color-mix(in srgb, var(--surface-400) 76%, transparent)` + `backdrop-filter: blur(20px)`
- Constellation canvas (Canvas API, 78 particles, pseudo-3D perspective projection, mouse parallax) runs as `position: fixed` full-viewport background on homepage
- Atmospheric large-blur shadows (`28px, 70px`) — diffused depth, never hard-edged

---

## 2. Color Palette & Roles

### CSS Variables (copy-paste ready)

```css
/* Light mode (:root) */
--background:          #f2f1ed;   /* warm cream page bg */
--surface-100:         #f7f7f4;   /* lightest surface */
--surface-200:         #f2f1ed;   /* = background */
--surface-300:         #ebeae5;   /* button bg, subtle emphasis */
--surface-400:         #e6e5e0;   /* card bg, glass base */
--surface-500:         #e1e0db;   /* deeper emphasis */
--foreground:          #26251e;   /* warm near-black, primary text */
--foreground-secondary: rgba(38, 37, 30, 0.55);  /* muted text */

/* Brand — Hybrid palette */
--brand-from:          #C9A84C;   /* champagne gold — UI accents (nav, borders, glow) */
--brand-to:            #D4AF37;   /* amber gold — secondary accent, logo hub color */
--cta-action:          #f54e00;   /* signal orange — PRIMARY CTA BUTTON ONLY */

/* Borders */
--border-warm:         rgba(38, 37, 30, 0.10);
--border-warm-md:      rgba(38, 37, 30, 0.20);
--border-warm-strong:  rgba(38, 37, 30, 0.55);

/* Shadows */
--shadow-card:
  rgba(0,0,0,0.14) 0px 28px 70px,
  rgba(0,0,0,0.10) 0px 14px 32px,
  rgba(38,37,30,0.10) 0px 0px 0px 1px;
--shadow-ambient:
  rgba(0,0,0,0.03) 0px 0px 16px,
  rgba(0,0,0,0.01) 0px 0px 8px;

/* Dark mode (.dark) */
--background:          #1a1814;
--surface-100:         #201e18;
--surface-300:         #242019;
--surface-400:         #2a261e;
--surface-500:         #302c22;
--foreground:          #e8e6de;
--foreground-secondary: rgba(232, 230, 222, 0.55);
--brand-from:          #D4AF37;   /* brighter amber on dark bg */
--brand-to:            #C9A84C;
--cta-action:          #f76a2a;   /* slightly lighter orange for dark bg */
```

### Palette Quick Reference

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `#f2f1ed` | `#1a1814` | Page background |
| `--surface-400` | `#e6e5e0` | `#2a261e` | Card background base |
| `--foreground` | `#26251e` | `#e8e6de` | Primary text |
| `--foreground-secondary` | `rgba(38,37,30,0.55)` | `rgba(232,230,222,0.55)` | Muted text, labels |
| `--brand-from` | `#C9A84C` | `#D4AF37` | Gold accent — nav active, borders, glow |
| `--brand-to` | `#D4AF37` | `#C9A84C` | Amber — secondary accent |
| `--cta-action` | `#f54e00` | `#f76a2a` | CTA button background ONLY |
| `--border-warm` | `rgba(38,37,30,0.10)` | `rgba(232,230,222,0.10)` | Standard border |

### Constellation Logo Palette (match exactly for on-brand components)

| Node | Hex | Usage |
|---|---|---|
| Gold nodes (G cluster) | `#C9A84C` | = `--brand-from` light mode |
| Amber hub | `#D4AF37` | = `--brand-to` light / `--brand-from` dark |
| Silver nodes (S cluster) | `#B8B8B8`, `#D0D0D0` | Decorative only |
| Hub glow disc | `#FFF1D0` at 20% opacity | Ambient glow |

### Syntax Highlighting (sugar-high, warm Cursor palette)

```css
--sh-keyword:    #f87840;   /* orange — keywords */
--sh-string:     #9fc9a2;   /* sage — strings */
--sh-comment:    rgba(232,230,222,0.38);  /* muted */
--sh-class:      #c0a8dd;   /* lavender — classes */
--sh-property:   #9fbbe0;   /* blue — properties */
--sh-entity:     #dfa88f;   /* peach — entities */
--sh-identifier: #e8e6de;   /* near-white */
```

---

## 3. Typography

### Font Stack

| Role | Font | CSS Variable | Fallbacks |
|---|---|---|---|
| **Heading / Display / UI** | Exo 2 | `--font-heading`, `--font-sans` | `system-ui, sans-serif` |
| **Blog body / Editorial** | Lora | `--font-serif` | `"Iowan Old Style", Georgia, serif` |
| **Code / Technical** | Roboto Mono | `--font-mono` | `ui-monospace, Menlo, monospace` |

### Hierarchy

| Role | Size | Weight | Letter-spacing | Line-height | Font |
|---|---|---|---|---|---|
| Hero H1 | `text-4xl` → `text-5xl` (sm) | 700 | `-0.035em` | `1.1` | Exo 2 |
| Section H2 | `text-3xl` | 700 | `-0.03em` (global) | tight | Exo 2 |
| Card H2 | `text-xl` | 700 | `-0.022em` | tight | Exo 2 |
| Post title | `text-xl` | 700 | default | snug | Exo 2 |
| Body text | `text-base` | 400 | normal | `1.78` | Lora (prose) / Exo 2 (UI) |
| Secondary / muted | `text-sm` | 400 | normal | relaxed | Exo 2 |
| Micro labels | `text-xs` font-semibold uppercase tracking-widest | 600 | `widest` | — | Exo 2 |
| Code inline | `text-sm` (0.875em) | 400 | normal | — | Roboto Mono |
| Dates / mono | `text-xs` tabular-nums | 400-500 | normal | — | Roboto Mono |

### Principles
- Headings always use `font-heading` (Exo 2) with negative letter-spacing
- Blog post body uses `font-serif` (Lora) for readability in long-form
- Never mix serif body with serif headings — keep the Exo 2 / Lora separation clean
- `tracking-widest` + `uppercase` for micro-labels (category section titles, stat labels)

---

## 4. Components

### Primary CTA Button
```tsx
// Background = --cta-action (orange) ONLY here
<Link
  href="/about/"
  className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
  style={{ backgroundColor: "var(--cta-action)" }}
>
  About / Giới thiệu
</Link>
```
- Background: `var(--cta-action)` — **only place orange is allowed**
- Text: `text-white`
- Radius: `rounded-lg` (8px)
- Hover: `hover:opacity-90`

### Secondary / Ghost Button
```tsx
<Link
  href="/blog/"
  className="rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-80"
  style={{
    backgroundColor: "color-mix(in srgb, var(--surface-300) 80%, transparent)",
    border: "1px solid var(--border-warm)",
    color: "var(--foreground)",
  }}
>
  Blog →
</Link>
```
- Background: `var(--surface-300)` or `color-mix(surface-300 80%, transparent)` for glass
- Border: `var(--border-warm)`
- Text: `var(--foreground)`

### Glass Card (homepage hero, topics panel)
```tsx
// GLASS style constant
const GLASS: CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--surface-400) 76%, transparent)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid var(--border-warm)",
  boxShadow: "var(--shadow-card)",
};

<div className="relative overflow-hidden rounded-2xl" style={GLASS}>
  {children}
</div>
```

### Standard GradientCard (blog, about)
```tsx
// GradientCard component — opaque, no glass
<div
  className={`rounded-xl p-6 transition-shadow hover:shadow-lg ${className}`}
  style={{
    backgroundColor: "var(--surface-400)",
    border: "1px solid var(--border-warm)",
    boxShadow: "var(--shadow-ambient)",
  }}
>
```
- Use for blog post cards, about sections
- Hover upgrades from `--shadow-ambient` to Tailwind `shadow-lg`

### Category Pill (tags / filters)
```tsx
// getCategoryPillClasses(cat) returns Tailwind classes per category:
// data-science  → bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300
// data-engineering → bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300
// gen-ai        → bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300
// banking       → bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300

<span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide ${getCategoryPillClasses(cat)}`}>
  {getCategoryLabel(cat)}
</span>
```

### Stat Card
```css
/* globals.css */
.stat-card {
  border-left: 3px solid var(--brand-from);  /* gold accent bar */
}
```
```tsx
<div className="stat-card pl-3">
  <p className="text-[0.65rem] font-semibold uppercase tracking-wider"
    style={{ color: "var(--foreground-secondary)" }}>
    LABEL
  </p>
  <p className="mt-0.5 font-heading text-sm font-semibold"
    style={{ color: "var(--foreground)" }}>
    Value
  </p>
</div>
```

### Navigation (SiteNav)
- Sticky, `top-0 z-40`, `backdrop-blur-md`
- Background: `color-mix(in srgb, var(--surface-200) 85%, transparent)`
- Active link: `color: var(--brand-from)` + animated underbar (`scaleX(1)`)
- Hover: text shifts to `var(--brand-from)` (gold)
- Logo: `font-heading font-bold text-lg`, color `var(--foreground)`

### Blog Sidebar (BlogNav)
- Width: 220px default, draggable 120px–400px, collapses to 40px
- Active post: `color: var(--brand-from)` + orange dot indicator
- Category headers: `text-[10px] uppercase tracking-[0.14em] font-bold`
- Tree connector: `border-l` in `var(--border-warm-md)`

### TOC (BlogToc)
- `xl:block` only, sticky `top-20`, width 200px
- Active heading: `.toc-link-active { color: var(--brand-from); font-weight: 600; }`

### Blog Post Item
```css
/* globals.css */
.post-item:hover { background-color: color-mix(in srgb, var(--brand-from) 4%, transparent); }
.post-accent { opacity: 0; transition: opacity 150ms; }
.post-item:hover .post-accent { opacity: 1; }   /* gold left bar appears */
.post-title-link { color: var(--foreground); transition: color 150ms; }
.post-title-link:hover { color: var(--brand-from); }
```
```tsx
<li className="post-item relative">
  <span className="post-accent absolute left-0 top-0 h-full w-[3px]"
    style={{ backgroundColor: "var(--brand-from)" }} />
  <div className="px-6 py-5">
    <span className={`... ${getCategoryPillClasses(post.category)}`}>{getCategoryLabel(post.category)}</span>
    <h3 className="font-heading text-xl font-bold">
      <Link href={`/blog/${post.slug}/`} className="post-title-link">{post.title}</Link>
    </h3>
  </div>
</li>
```

### Code Blocks (blog prose)
```css
/* globals.css — .beguru-docs.prose pre */
background-color: #2a2620;            /* warm dark editor bg */
border-left: 3px solid rgba(201,168,76,0.55);  /* gold stripe */
color: #e8e6de;
font-family: var(--font-mono);
```

### 3D Hero Tilt Card (HeroTiltCard)
```tsx
// Mouse move: perspective(1400px) rotateY(±6°) rotateX(±4°) scale3d(1.012)
// Mouse leave: spring back cubic-bezier(0.23,1,0.32,1) 0.65s
<HeroTiltCard className="relative overflow-hidden rounded-2xl" style={GLASS}>
  {children}
</HeroTiltCard>
```

### Constellation Canvas (ConstellationBg)
```tsx
// Fixed full-viewport background on homepage
// 78 particles: #C9A84C (gold ×3), #D4AF37 (amber ×2), #B8B8B8 (silver ×2), #C08532 (warm gold ×1)
// Pseudo-3D: perspective projection, z: –200…+200
// Mouse parallax: drifts 0.00007× cursor offset
// Connection lines: rgba(195,160,80, alpha) fading at 26% of min(W,H)
<div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
  <ConstellationBg />
</div>
// All content sits at zIndex: 1
```

---

## 5. Layout

### Page Structure
```
<html>
  <body>
    <SiteNav />           — sticky top, z-40
    <main>
      {page content}      — no padding here; each page owns its container
    </main>
    <ScrollToTop />
    <footer />            — max-w-6xl mx-auto px-4 py-8
  </body>
</html>
```

### Homepage Layout
```
position: relative           — constellation positioning context
  fixed inset-0 z-0          — ConstellationBg canvas
  relative z-1 max-w-6xl px-4 py-10
    HeroTiltCard (glass)     — flex-col-reverse md:flex-row
      text stack (flex-1)    — greeting → h1 → VI → EN → CTAs
      CharlieLogoSVG 240px   — right on desktop, centered on mobile
      stat strip (grid 2/4)
    Topics section (glass)   — AnimatedPills with IntersectionObserver
```

### Blog Layout
```
flex min-h-screen
  BlogNav (hidden lg:flex)   — 220px default, draggable
  div flex-1 px-4 py-10 lg:px-8
    [blog content]
      BlogToc (xl:block)     — sticky right, 200px
```

### Container
- Max width: `max-w-6xl` (72rem / 1152px)
- Page padding: `px-4` → `lg:px-8`
- Section spacing: `space-y-10` (homepage), `space-y-12` (blog index)

### Grid & Spacing
- Stat strip: `grid-cols-2 gap-3 sm:grid-cols-4`
- Base unit: 8px (`gap-2` = 8px, `gap-3` = 12px, `gap-4` = 16px)
- Card padding: `p-6 sm:p-8`
- Section scroll offset for anchors: `scroll-mt-24`

### Breakpoints (Tailwind defaults)
| Name | Width | Key change |
|---|---|---|
| `sm` | 640px | Logo + text side-by-side in hero |
| `md` | 768px | Hero flex-row, blog sidebar transitions |
| `lg` | 1024px | BlogNav appears |
| `xl` | 1280px | BlogToc appears |

---

## 6. Depth & Elevation

| Level | Style | Used For |
|---|---|---|
| Flat | none | Body text areas, inline content |
| Border ring | `1px solid var(--border-warm)` | Standard card/container edge |
| Ambient | `var(--shadow-ambient)` | GradientCard default, warm-card hover |
| Card | `var(--shadow-card)` | Glass cards, hero, modals — large diffused blur |
| 3D tilt | `perspective(1400px) rotateX/Y` | Hero card on mouse move |

**Shadow philosophy**: large blur radius (28px, 70px) with low opacity (0.10–0.14) creates diffused atmospheric lift, not hard drop shadows. Cards feel like they open a space in the page.

---

## 7. Animation & Motion

### CSS Keyframes (globals.css)

| Name | Effect | Used On |
|---|---|---|
| `page-fade-up` | `translateY(18px)→0 + opacity` | Hero text stagger on load |
| `pill-pop` | `scale(0.85)→1 + translateY(10px)→0` | Category pills on scroll enter |
| `charlie-arc-draw` | `stroke-dashoffset 488→0` | SVG logo circle arc |
| `charlie-line-draw` | `stroke-dashoffset 220→0` | SVG logo connection lines |
| `charlie-dot-in` | `scale(0)→1 + opacity` | SVG logo dots |
| `charlie-glow-bloom` | `opacity 0→0.2` | SVG hub glow |
| `charlie-float` | `translateY(0↔-8px)` | SVG logo continuous float |
| `charlie-pulse` | `opacity 0.18↔0.38` | Hub glow pulse |
| `search-in` | `scale(0.97)→1 + translateY(-4px)→0` | Search dialog entrance |

### Stagger Pattern (homepage hero)
```tsx
const FU = (delay: string) =>
  `page-fade-up 0.58s cubic-bezier(0.22,1,0.36,1) ${delay} both`;

// Greeting    → FU("0.05s")
// H1          → FU("0.18s")
// VI paragraph → FU("0.32s")
// EN paragraph → FU("0.46s")
// CTA buttons  → FU("0.60s")
// Stat card i  → FU(`${0.70 + i * 0.10}s`)
```

### Timing Guidelines
- Color / border transitions: `150ms ease`
- Shadow transitions: `200ms ease`
- Card tilt tracking: `0.08s ease-out` (fast, tracks cursor)
- Card tilt reset: `0.65s cubic-bezier(0.23,1,0.32,1)` (spring snap-back)
- Sidebar width: `200ms ease-in-out`
- Pill pop spring: `0.35s cubic-bezier(0.34,1.56,0.64,1)` (overshoot)

### Accessibility
```css
@media (prefers-reduced-motion: reduce) {
  .pills-visible .pill-item { animation: none !important; opacity: 1 !important; }
  *[style*="page-fade-up"] { animation: none !important; opacity: 1 !important; }
}
```
ConstellationBg and HeroTiltCard both check `window.matchMedia("(prefers-reduced-motion: reduce)")` on mount and skip all animation.

---

## 8. Responsive Behavior

### Hero (homepage)
- Mobile: `flex-col-reverse` — logo centered above text, logo 240px but visually fits
- `md+`: `flex-row items-center` — text left (flex-1), logo right (240px fixed)
- Stat strip: `grid-cols-2` → `sm:grid-cols-4`

### Blog Sidebar
- `< lg`: hidden
- `lg+`: 220px default, draggable 120–400px, collapse to 40px
- Persisted in `localStorage` key `"blog-nav-width"`

### Blog TOC
- `< xl`: hidden
- `xl+`: 200px fixed right column, sticky `top-20`

---

## 9. Agent Prompt Guide

> Copy-paste these prompts to vibe-code new components that match the design system exactly.

### Quick Token Reference
```
Page bg (light):      #f2f1ed
Page bg (dark):       #1a1814
Primary text:         var(--foreground)         [#26251e / #e8e6de]
Muted text:           var(--foreground-secondary) [rgba 55%]
Gold accent:          var(--brand-from)          [#C9A84C / #D4AF37]
Amber accent:         var(--brand-to)            [#D4AF37 / #C9A84C]
CTA button bg:        var(--cta-action)          [#f54e00 / #f76a2a]
Card bg:              var(--surface-400)          [#e6e5e0 / #2a261e]
Glass card:           color-mix(in srgb, var(--surface-400) 76%, transparent) + backdrop-blur(20px)
Standard border:      var(--border-warm)          [rgba(38,37,30,0.10)]
Card shadow:          var(--shadow-card)
Ambient shadow:       var(--shadow-ambient)
Heading font:         font-heading (Exo 2)
Body font (prose):    font-serif (Lora)
Code font:            font-mono (Roboto Mono)
```

### Example Prompts

**New homepage section card:**
> "Create a section card below the Topics panel. Use glass style: `backgroundColor: 'color-mix(in srgb, var(--surface-400) 76%, transparent)'`, `backdropFilter: 'blur(20px)'`, `border: '1px solid var(--border-warm)'`, `boxShadow: 'var(--shadow-card)'`, `borderRadius: '1rem'`. Heading `font-heading text-xl font-bold` in `var(--foreground)`. Body text `text-sm` in `var(--foreground-secondary)`. Animate in with `page-fade-up 0.58s cubic-bezier(0.22,1,0.36,1) 0.3s both`."

**New CTA button:**
> "Primary action button: `backgroundColor: 'var(--cta-action)'`, `text-white`, `rounded-lg px-5 py-2.5 text-sm font-semibold`, `hover:opacity-90`. Secondary/ghost button: `backgroundColor: 'var(--surface-300)'`, `border: '1px solid var(--border-warm)'`, `color: 'var(--foreground)'`, `rounded-lg px-5 py-2.5 text-sm font-semibold`."

**New stat/metric card:**
> "Stat card with gold left bar: `className='stat-card pl-3'` (`.stat-card { border-left: 3px solid var(--brand-from); }`). Label: `text-[0.65rem] font-semibold uppercase tracking-wider` in `var(--foreground-secondary)`. Value: `font-heading text-sm font-semibold` in `var(--foreground)`."

**New blog section / article card:**
> "Article card using `GradientCard` component. Inside: category pill with `getCategoryPillClasses(cat)` (`rounded-md px-2.5 py-0.5 text-xs font-bold tracking-wide`). Date in `font-mono text-xs` `var(--foreground-secondary)`. Title `font-heading text-xl font-bold` with `.post-title-link` class (gold on hover via CSS). Excerpt `text-sm line-clamp-2` `var(--foreground-secondary)`. Wrap `<li>` in `.post-item` with `.post-accent` left border."

**New navigation link:**
> "Nav link: `text-sm font-medium` in `var(--foreground-secondary)`, hover shifts to `var(--brand-from)` (gold). Active state: `color: var(--brand-from)` + 2px bottom border via `scaleX(1)` transform. Transition: `150ms ease`."

**New full-page animated section (homepage only):**
> "Homepage-only full-viewport fixed background: place `<ConstellationBg />` in `<div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>`. All page content at `position: relative; z-index: 1`. Cards use GLASS style with `backdropFilter: blur(20px)`. Wrap hero card in `<HeroTiltCard>` for 3D mouse tilt (±6° horizontal, ±4° vertical)."

**Dark mode safe rule:**
> "Always use `var(--foreground)` / `var(--foreground-secondary)` for text — never hardcode `#26251e` or `text-zinc-*`. Use `var(--surface-*)` for backgrounds. For gold accents use `var(--brand-from)`. For orange CTA button only use `var(--cta-action)`. This ensures automatic dark mode switching."

### Iteration Rules
1. **Warm tones always** — cream light bg, brown-black dark bg, never pure white/black for surfaces
2. **Gold = identity, Orange = action** — `--brand-from` for nav/borders/glow, `--cta-action` only for primary CTA buttons
3. **Glassmorphism on homepage, solid GradientCard elsewhere** — glass only where constellation canvas shows behind
4. **Font voices**: Exo 2 for all headings/UI, Lora for blog body, Roboto Mono for code
5. **Letter-spacing scales with size**: `-0.035em` at H1, `-0.022em` at H2/H3, normal at body
6. **Animation fill-mode `both`** — elements start invisible (`opacity: 0`) and stay visible after animation
7. **CSS variables for hover states** — server components use CSS classes (`.post-item`, `.post-title-link`) instead of JS event handlers
8. **Shadow scale**: `--shadow-ambient` for default cards, `--shadow-card` for elevated glass cards
9. **Spacing base**: 8px system — prefer `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `p-6` (24px), `p-8` (32px)
10. **Max content width**: always `max-w-6xl mx-auto px-4` for page containers
