# Handoff: tylermartins.com — analytics portfolio shell + football section

## Overview
A domain-agnostic **portfolio shell** (nav rail, top bar, footer, section routing) hosting
**sections**; each section holds reusable **content types**. Football (soccer) analytics is the
first section and the only one built now, with two content types live:

1. **Component showcase** — Storybook-style gallery of the 16 `footballd3` d3 charts, each with a
   preview, one-line description, and a code snippet.
2. **Match analysis dashboard** — a single-match dashboard composed of `footballd3` charts
   (momentum, shot maps, pass network, match stats).

The shell must **not** hard-code football as the whole site. Adding a second section later must
require only adding a route + a rail entry — no structural rework. Do **not** build "coming soon"
placeholders; just don't let the structure assume football is the only section.

## About the design files
The files in this bundle are **design references created in HTML** (`tylermartins.dc.html` is the
locked direction; `Landing Directions.dc.html` shows the three explored directions — 1b "The
Console" was chosen). They are prototypes showing intended look and behavior, **not production
code to copy**. The task is to **recreate them in Next.js + Tailwind + shadcn/ui** using standard
tokens and components — nothing exotic. The interactive prototype fakes routing with React state;
in the real app these are real Next.js routes.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and radii are final and come from
`footballd3/style.css` (the single source of truth — chrome and charts share one token set).
Recreate pixel-faithfully with Tailwind + shadcn. The chart SVGs in the prototype are **schematic
placeholders** — in the real app the actual `footballd3` d3 components render there. Match the
*frame, sizing, and token usage* around them, not the placeholder geometry.

---

## Target stack
- **Next.js (App Router)** on Vercel
- **Tailwind CSS** with the token config below
- **shadcn/ui** themed to the same tokens (so chrome and charts read as one product)
- **footballd3** charts imported as-is and mounted into React wrappers

---

## Design tokens (single source of truth)

From `footballd3/style.css`. Both charts and site UI consume these. Light + dark are driven by a
`data-theme` attribute on `<html>` (shadcn's standard `.dark` class also works — see config).

### Color — light (`:root`)
| Token | Hex | Role |
|---|---|---|
| `background` | `#FAF7F0` | page background (warm cream) |
| `surface` | `#FFFDF8` | cards / rail |
| `elevated` | `#FFFFFF` | preview frames, inputs, code blocks |
| `border` | `#E5E5E5` | hairlines |
| `border-strong` | `#D6D3CC` | axis / stronger dividers |
| `text` | `#171717` | primary text |
| `muted` | `#525252` | secondary text |
| `faint` | `#8A8578` | labels / meta |
| `focal` | `#9F1239` | crimson — primary accent, home team, CTAs |
| `focal-soft` | `rgba(159,18,57,0.13)` | shot/marker fills |
| `secondary` (navy) | `#1E3A5F` | away team, secondary series |
| `secondary-soft` | `rgba(30,58,95,0.12)` | navy fills |
| `pitch` | `#1E3A5F` | pitch line stroke |
| `grid` | `#ECE8DF` | grid lines |

### Color — dark (`[data-theme="dark"]`)
| Token | Hex |
|---|---|
| `background` | `#1A1613` |
| `surface` | `#211D18` |
| `elevated` | `#2A2521` |
| `border` | `#34302A` |
| `border-strong` | `#403A32` |
| `text` | `#F5F0E6` |
| `muted` | `#A39E95` |
| `faint` | `#78716C` |
| `focal` | `#F43F5E` |
| `focal-soft` | `rgba(244,63,94,0.17)` |
| `secondary` (navy) | `#5B8AC0` |
| `secondary-soft` | `rgba(91,138,192,0.16)` |
| `pitch` | `#5B8AC0` |
| `grid` | `#2A2521` |

All pairs meet **WCAG AA** for their use (text on background, accents as large text / graphical).
Verify `muted`/`faint` on `surface` at their rendered sizes if you shrink them.

### Typography
| Family | Stack | Use |
|---|---|---|
| Display | `"Fraunces", Georgia, serif` (900, `font-variation-settings:"opsz" 144`) | headings, scores, section titles |
| Body | `"Geist", system-ui, sans-serif` (400–700) | prose, card descriptions |
| Mono | `"Geist Mono", "SF Mono", Menlo, monospace` (400–500) | labels, nav, breadcrumbs, code, all data/numbers |

Load via `next/font/google` (Fraunces variable `opsz,wght`; Geist; Geist Mono). Fraunces `WONK` axis
is part of the footballd3 signature — request it if you want the exact character (`.display` class
in `style.css`). Kickers/labels are mono, uppercase, `letter-spacing: 0.1–0.14em`.

### Type scale (rendered sizes)
- Hero display: 58px / line-height 1.02 / letter-spacing -0.015em
- Section H1: 44–46px / 1.03
- Card title (Fraunces 600): 21–24px
- Body: 16–18px / 1.6
- Mono label / kicker: 10–13px
- Code: 11.5px

### Spacing rhythm
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` px (Tailwind `1 2 3 4 6 8 12 16`).

### Radius
- Buttons / chips / code blocks: `6px`
- Cards: `10px`
- Dashboard panels: `12px`
- Logo mark / small tags: `3–4px`
- Pills (theme toggle): `999px`

### Shadow
Cards on canvas use a soft low shadow only where lifted:
`0 20px 50px -30px rgba(23,23,23,0.4)` (light) / `rgba(0,0,0,0.6)` (dark). Most in-app cards use a
1px border, no shadow.

---

## Recommended repo structure
```
app/
  layout.tsx              # shell: fonts, ThemeProvider, <html data-theme>
  page.tsx                # LANDING (home)
  football/
    layout.tsx            # section layout: rail marks Football active + sub-nav
    page.tsx              # FOOTBALL INDEX (overview + content-type cards)
    components/page.tsx    # COMPONENT SHOWCASE
    dashboard/page.tsx     # MATCH DASHBOARD (or /dashboard/[matchId])
components/
  shell/
    Rail.tsx              # left nav (sections + site + theme toggle)
    TopBar.tsx            # breadcrumb + StatsBomb badge, sticky, blur
    Footer.tsx
    ThemeToggle.tsx
  StatsBombAttribution.tsx # reusable: logo swatch + "Data provided by StatsBomb" link
  charts/                 # React wrappers around footballd3 components
    ChartFrame.tsx        # titled panel: mono kicker + Fraunces title + slot
    ShotMap.tsx PassNetwork.tsx MomentumChart.tsx MatchStats.tsx ...
  showcase/
    ComponentCard.tsx     # preview frame + name + blurb + code snippet
lib/
  components.ts           # the 16-component registry (name, cat, blurb, code)
data/                     # committed StatsBomb sample datasets (JSON), per demo
```

### Section routing pattern (domain-agnostic)
Drive the rail from a config array, not hard-coded football:
```ts
// lib/sections.ts
export const sections = [
  { slug: "football", label: "Football", count: 17,
    contentTypes: [
      { slug: "",           label: "Overview" },
      { slug: "components",  label: "Components" },
      { slug: "dashboard",   label: "Match dashboard" },
    ] },
  // add the next section here — no shell changes needed
];
```
`Rail` maps over `sections`; the active section expands its `contentTypes` sub-nav. A new section
is a new entry + a new `app/<slug>/` route folder.

---

## Screens / views

### 1. Shell (wraps every page)
- **Left rail** — `240px`, `flex-shrink:0`, `border-right` 1px `border`, `background surface`,
  `position: sticky; top:0; height:100vh`, padding `22px 16px`, flex column.
  - Logo: 32px rounded-6 `focal` square, `T` in Fraunces 900 17px in `rail-active-fg`; wordmark
    `tylermartins` mono 12px + `.com` mono 10px `faint`. Clicking → home.
  - Group label "Sections" (mono 10px uppercase `faint`, `letter-spacing .14em`).
  - Section item "Football" — mono 13px, padding `9px 10px`, radius 6; **active** (any football
    route) = `background focal`, `color rail-active-fg`; count `17` right-aligned.
  - When inside football: indented sub-nav (`border-left` 1px) with Overview / Components /
    Match dashboard — active item = `background focal-soft`, `color focal`; idle `muted`.
  - Group "Site": About, Writing (mono 13px `muted`).
  - Bottom (mt-auto, `border-top`): theme toggle button — pill, `border`, `background elevated`,
    mono 11px, glyph `☾`/`☀` + `DARK`/`LIGHT`.
- **Top bar** — sticky, padding `14px 36px`, `border-bottom`, `background:
  color-mix(in srgb, var(--background) 86%, transparent)` + `backdrop-filter: blur(8px)`, z-index 5.
  Left: breadcrumb mono 12px `faint` (`~ / football / components`). Right: 14px `focal` swatch +
  "StatsBomb open data" mono 12px `muted`.
- **Footer** — `border-top`, padding `28px 36px`, flex space-between, wrap. Left: `© 2026 Tyler
  Martins · built with footballd3` (mono 12px `faint`). Right: GitHub / About links + inline
  StatsBomb attribution.

### 2. Landing (`/`)
- Purpose: who Tyler is, what this is, entry into sections.
- Layout: single column, `max-width 1180px`, padding `72px 36px 40px`. Tight — hero + section entry.
- Kicker (mono uppercase `focal`) → H1 Fraunces 900 58px, max 18ch: **"Match data, turned into
  tools."** → body 18px `muted` max 56ch (Tyler's positioning + StatsBomb note).
- Two content-type cards in `grid-template-columns: repeat(auto-fit, minmax(300px,1fr))`, gap 18,
  max-width 900: **Component library** (crimson kicker, "16 charts, each with sample data") and
  **Match dashboard** (navy kicker, "One match, fully told" + a small momentum-line SVG preview).
  Cards: `surface`, 1px `border`, radius 10, padding 24, clickable → route.

### 3. Football index (`/football`)
- Purpose: section overview + nav into its content types.
- Kicker "Section" → H1 "Football" (Fraunces 46px) → intro 17px max 60ch.
- Two large content-type cards (`auto-fit minmax(320px,1fr)`): each = 150px preview frame
  (`elevated`, schematic pitch/network SVG) + body (kicker, Fraunces 23px title, blurb).
  "Component showcase" and "Match analysis".

### 4. Component showcase (`/football/components`) — content type
- Purpose: browse the 16 footballd3 charts; each with preview + description + code.
- Header block (max 60ch): kicker "Football · component library", H1 "footballd3 components",
  intro noting demos use **small committed sample datasets — self-contained, reproducible, not
  live**.
- Grid: `repeat(auto-fill, minmax(340px,1fr))`, gap 20.
- **ComponentCard**: `surface`, 1px `border`, radius 10, flex column.
  - Preview frame: height 168px, `background elevated`, `border-bottom`, centered chart; top-left
    mono 10px `faint` "preview". *(Real app: mount the actual footballd3 component with its sample
    data here.)*
  - Meta: padding 18, gap 10. Row: component name (mono 15px 500 `text`) + category tag (mono 10px
    `faint`). Blurb (13px `muted`). Code block: `elevated`, 1px `border`, radius 6, padding
    `10px 12px`, `overflow-x:auto`, `<code>` mono 11.5px `white-space:pre`.
- **StatsBomb attribution** below the grid (see reusable element).
- Recommended enhancement for the real build: a category filter chip row (mono chips) driven by
  the `cat` field. Code snippets can become a Preview/Code tab (shadcn `Tabs`) per card.

### 5. Match dashboard (`/football/dashboard`) — content type, REAL surface
- Purpose: tell one match through footballd3 charts. Demo match: **World Cup Final 2022,
  Argentina 3–3 France (4–2 pens)** — swap for whatever the committed sample dataset contains.
- **Match header** card: `surface`, 1px `border`, radius 12, padding `24px 28px`, flex space-between
  wrap. Left cluster: team name (Fraunces 24) + xG (mono 11 `faint`), big score (Fraunces 900 40px,
  home in `focal`, away in `secondary`), team name. Right: competition / venue / result (mono 12,
  right-aligned).
- **Grid**: `repeat(auto-fit, minmax(300px,1fr))`, gap 18, `grid-auto-rows:auto`. Panel = `surface`,
  1px `border`, radius 12, padding `20–22px`. Each panel titled with mono kicker (`focal` for home
  charts, `secondary` for away, `muted` for neutral) + optional Fraunces sub-title.
  - **Primary — momentumChart**: `grid-column: 1 / -1` (full width). Title "Attacking momentum · xT
    per minute". Two mirrored area+line series (home `focal`, away `secondary`), baseline at mid,
    dashed vertical markers for goals. Legend row (mono) below.
  - **shotMap · Argentina** and **shotMap · France**: half-pitch, circle area = xG, filled = goal
    (team color), outlined `muted` = off-target. One panel each.
  - **passNetwork · Argentina**: nodes sized by pass count, edges by pair count, team color.
  - **matchStats · comparisonBars**: full-width panel, centered `max-width 720px`. Mirrored rows on
    a 5-col grid `48px 1fr auto 1fr 48px` — value, home bar (right-aligned, `focal`), centered mono
    label, away bar (`secondary`), value. Rows: Shots, Possession, xG (+ cards, etc.).
- **Attribution row** at bottom: `border-top`, StatsBomb attribution left + "Sample dataset ·
  committed to repo · reproducible" (mono 11 `faint`) right.
- **Mobile reflow**: `auto-fit minmax` already collapses every panel to a single column; the
  momentum panel stays full-width. Match header stacks (flex-wrap). Rail becomes a top drawer /
  hamburger on `< md` (shadcn `Sheet`), top bar keeps breadcrumb + toggle.

---

## Reusable component: StatsBomb attribution
Required **everywhere StatsBomb data appears** (showcase, dashboard, footer). Single component:
```
[ 16–18px focal-rounded swatch ]  "Data provided by StatsBomb"  (link → https://statsbomb.com)
```
Mono 12px, `muted` text, `StatsBomb` underlined linking out. Variants: inline (footer), bordered
chip (`surface`, 1px `border`, radius 8, padding `8px 12px` — showcase), and row-with-border-top
(dashboard). Replace the swatch with the real StatsBomb logo asset when available (keep the swatch
as fallback). This satisfies StatsBomb's attribution requirement — do not omit it on any surface
that renders their data.

---

## Interactions & behavior
- **Routing**: rail + cards navigate between real Next routes. Active route → rail highlight
  (section = solid `focal`; content-type = `focal-soft`/`focal`).
- **Theme toggle**: flips `data-theme` on `<html>`, persisted to `localStorage`, respects
  `prefers-color-scheme` on first load. Every token — including chart strokes/fills — is a CSS var,
  so charts recolor with the theme (footballd3 should read `var(--pitch)`, `var(--focal)`, etc. via
  CSS custom properties, matching `colors.py` for static exports).
- **Transitions**: `background 0.25s, color 0.25s` on the root for theme change. Cards: subtle
  hover lift / border-strong on hover (add per shadcn).
- **Top bar**: sticky with backdrop blur.

## State management
- `theme` — `'light' | 'dark'`, in a ThemeProvider (or `next-themes`), persisted.
- Route state is the URL (Next router) — the prototype's `route` state becomes real pages.
- Showcase/dashboard read **committed local sample JSON** (`/data/*`), never live fetches.

## Assets
- **Fonts**: Fraunces, Geist, Geist Mono (Google Fonts via `next/font`).
- **StatsBomb logo**: not bundled — obtain the official mark; swatch is the placeholder.
- **Sample datasets**: StatsBomb-derived, trimmed, committed to the repo (you provide these).
- **Chart SVGs in prototype**: schematic placeholders — replace with real footballd3 output.

## Files in this bundle
- `tylermartins.dc.html` — locked direction (1b "The Console"): full shell + all four surfaces +
  light/dark toggle. Primary reference.
- `Landing Directions.dc.html` — the three explored landing directions (1a Column, 1b Console
  ★chosen, 1c Split). Reference for the rejected options only.
