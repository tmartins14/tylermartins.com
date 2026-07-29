# Handoff: footballd3 Component Library Explorer

## Overview
An interactive explorer for the 16-component **footballd3** chart library (the d3 charting layer behind the Match Analysis Dashboard). It presents every component as a dense, indexed list. Each row is clickable and expands into a large modal where the component renders full-size and interactively on the **UEFA Euro 2024 Final** sample (Spain 2–1 England, StatsBomb match `3943043`). The modal carries the component's blurb, live controls (team/mode/playback), its API snippet, and a peek at the sample rows feeding it.

This is the "Cockpit index" direction (dark, dense) selected from two explored options.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look and behavior, **not production code to copy directly**.

- `Component Library.dc.html` is authored in a bespoke "Design Component" runtime (`support.js`). It is a single class (`class Component extends DCLogic`) that builds all markup via `React.createElement`. **Do not ship this file or `support.js`.** They are a reference implementation only.
- The task is to **recreate this design in the target codebase** — the existing Next.js / React + TypeScript app at `tmartins14/tylermartins.com`, reusing its patterns, the real `footballd3` d3 components from `tmartins14/football-analytics`, and the existing showcase scaffolding (`lib/components.ts`, `components/showcase/*`, `lib/sections.ts`).
- Crucially: in the real app the previews should be rendered by the **actual footballd3 d3 functions**, not the SVG stand-ins used in this prototype. The prototype hand-draws each chart only to communicate layout, encodings, colors, and interaction. Wire the real `shotMap`, `passNetwork`, etc. into the same gallery/modal shell.

## Fidelity
**High-fidelity.** Colors, typography, spacing, layout, and interactions are final and exact. Recreate pixel-faithfully using the codebase's libraries. The one intentional exception is the chart drawings themselves (see above) — match the *encodings and framing* shown, but render them with the real d3 components.

## Screens / Views

### 1. Gallery — "Cockpit index"
- **Purpose**: Browse all 16 components, grouped by category, and pick one to inspect in isolation.
- **Layout**:
  - Page background `#EDEAE3`. Full-width content with `44px` horizontal padding.
  - **Header block** (`30px 44px 6px`): eyebrow `footballd3 · component library` (Geist Mono, 12px, uppercase, letter-spacing `0.14em`, color `#9F1239`); H1 `Explore the library` (Fraunces, weight 900, 34px, `#171717`, `font-variation-settings: "opsz" 144`); intro paragraph (Geist, 13.5px, `#525252`, line-height 1.6, `max-width: 82ch`) — bolds the match name.
  - **The gallery panel** is a single dark card, full width: background `#1A1613`, border `1px solid #403A32`, border-radius `16px`, `box-shadow: 0 40px 90px -50px rgba(0,0,0,0.7)`, inner padding `20px 20px 8px`, overflow hidden.
  - Inside, components are grouped into **6 category sections** in this order: `Pitch overlays` (7), `Shots` (1), `Network & shape` (2), `Heat surfaces` (2), `Bars & tables` (2), `Time series` (2).
  - **Category header**: a row with the label (Geist Mono, 11px, uppercase, letter-spacing `0.12em`, color `#F43F5E`), a `1px` hairline rule filling remaining width (`#34302A`), and a count (Geist Mono, 10px, `#78716C`). Margin `0 0 12px`.
  - **Component rows** stack in a column. Each row is a CSS grid: `grid-template-columns: 170px 88px 1fr 132px`, `align-items: center`, `gap: 16px`, `padding: 12px 8px`, and a top border `1px solid #34302A`.
    - Col 1 — component name (Geist Mono, 13.5px, weight 600, `#F5F0E6`).
    - Col 2 — category tag (Geist Mono, 10px, uppercase, letter-spacing `0.06em`, color `#F43F5E`).
    - Col 3 — blurb (Geist, 12px, line-height 1.45, `#A39E95`, clamped to 2 lines via `-webkit-line-clamp`).
    - Col 4 — a `132×74` thumbnail tile: background `#2A2521`, border `1px solid #34302A`, border-radius `7px`, centered; renders a small version of the component (real footballd3 render at reduced size / minimal chrome).
  - **Row hover**: background transitions to `#2A2521` (`elev`). Whole row `cursor: pointer`; click opens the modal for that component.

### 2. Component modal (expanded view)
- **Purpose**: Inspect and interact with one component alone, full-size, with metadata.
- **Trigger**: click any gallery row. Opens a fixed overlay.
- **Overlay**: `position: fixed; inset: 0; z-index: 50; background: rgba(23,20,15,0.55); backdrop-filter: blur(3px);` centers its panel; padding `24px`. Fade-in `ovIn` 0.2s ease. Clicking the overlay (outside the panel) closes it. `Esc` should also close it (add in real impl).
- **Panel**: `width: min(1040px, 92vw); max-height: 88vh;` background `#211D18`, border `1px solid #403A32`, border-radius `16px`, overflow hidden, `box-shadow: 0 50px 120px -40px rgba(0,0,0,0.6)`. Enter animation `pnlIn` 0.28s `cubic-bezier(0.2,0.8,0.2,1)` (fade + scale `0.965→1` + translateY `10px→0`). Clicks inside the panel must not bubble to the overlay (stopPropagation).
- **Panel header** (`14px 20px`, bottom border `1px solid #34302A`): left group — category tag chip (Geist Mono 11px, `#F43F5E` text, `1px solid #F43F5E`, radius 5px, padding `2px 8px`, uppercase) + component name (Fraunces, weight 600, 22px, `#F5F0E6`, opsz 144). Right group — `Euro 2024 Final · 3943043` (Geist Mono, 11px, `#78716C`) + a `32×32` close button (`✕`, `1px solid #34302A`, radius 8px, transparent bg, `#A39E95`).
- **Panel body**: flex row, two columns.
  - **Stage** (`flex: 1`, padding `26px 28px`, background `#1A1613`, centered): the live full-size component render. Stage sizing per component (see below).
  - **Rail** (`width: 300px`, left border `1px solid #34302A`, padding `22px`, vertical stack, `gap: 20px`, scrolls):
    - **About** — section label (Geist Mono, 11px, uppercase, letter-spacing `0.1em`, `#78716C`) + blurb (Geist, 13px, line-height 1.6, `#A39E95`).
    - **Controls** (only if the component has any) — the team switcher and/or mode toggle and/or playback controls.
    - **API** — the code snippet in a `<pre>`: background `#2A2521`, border `1px solid #34302A`, radius 8px, padding `11px 12px`, Geist Mono 11.5px, line-height 1.5, `#F5F0E6`.
    - **Sample data** — a `<pre>` peek of the first 3–4 rows feeding the component: same box styling, Geist Mono 10.5px, `#A39E95`, `max-height: 150px`, scrolls. (Toggleable — see Tweaks.)

## Interactions & Behavior
- **Open**: click a gallery row → set `open = {key, dir}`, reset `playStep = 20`, `playing = false`.
- **Close**: overlay click or `✕` → `open = null`, stop any playback interval. Add `Escape` key handler in the real build.
- **Team switcher** (`Spain` / `England`): segmented control. Shown for components whose data is team-specific: `shotMap, passNetwork, formation, teamShape, progressiveMap`. Switching swaps the dataset (home = Spain = `#F43F5E` accent; away = England = `#5B8AC0` navy accent) and re-renders. State is global (`side`) so it persists across opens.
- **Mode toggle**: segmented control, per-component options:
  - `pitch`: Vertical / Horizontal
  - `convexHull`: Offense / Defense
  - `teamShape`: In poss. / Out poss.
  - `progressiveMap`: Passes / Carries / All
  - `eventScatter`: All / Pass / Shot
  - `momentumChart`: Curve / Bars
- **Playback** (only `playAnimation`): a `▶ Play / ❚❚ Pause` button (toggles a `setInterval` advancing `playStep` ~1%/55ms, stops at 100) + a percentage readout + a range slider (`0–100`, `accent-color: #F43F5E`) that scrubs and pauses on input. Clear the interval on close/unmount.
- **Hover readouts**:
  - `shotMap`: hovering a shot shows `player · minute' · xG x.xx · outcome` under the chart (accent color); default shows totals `N shots · G goals · xG x.xx`.
  - `momentumChart`: hovering the timeline shows `minute' · team threat ±x.xx`; default prompt text.
- **Segmented control styling**: inline-flex of buttons, `-1px` left margin to collapse borders, first/last get rounded outer corners (`4–5px`). Active button: border + text in the accent, background the accent's soft tint, `z-index: 1`. Inactive: `#34302A` border, `#A39E95` text, transparent bg. Font Geist Mono 10.5–11px.

## State Management
- `open: { key, dir } | null` — which component modal is open.
- `side: 'home' | 'away'` — global team selection (Spain / England).
- `view: { [componentKey]: modeValue }` — per-component mode selection. Defaults: `pitch:'vertical', teamShape:'in', progressiveMap:'pass', eventScatter:'all', momentumChart:'curve', convexHull:'offense'`.
- `hover: { [instanceKey]: datum | null }` — transient hover readout state.
- `mom: { [instanceKey]: datum | null }` — momentum hover readout.
- `playStep: number (0–100)`, `playing: boolean` — playback state; backed by a single interval handle cleared on close/unmount.
- **Data**: in the real app, replace the prototype's inlined `D()` sample object with the real Euro 2024 Final event/tracking data, fed through the real footballd3 extractors from `football-analytics`. See the "Sample data" section below for the shape each component expects.

## Component Registry (all 16)
Category · key · blurb · controls · sample-data shape. `home`=Spain, `away`=England.

**Pitch overlays**
1. `pitch` — StatsBomb 120×80 pitch base layer; returns `{ g, px }`. Modes: full/half, horizontal/vertical. No team. *(prototype exposes Vertical/Horizontal toggle.)*
2. `freezeFrame` — 360 freeze-frame dot overlay for a single goal instant; encodes teammate/opponent/actor/keeper. Rendered on a half-pitch. Legend below. Data: `{ r:'a'|'t'|'o'|'k', x, y, n? }` (roles: actor/teammate/opponent/keeper).
3. `convexHull` — convex-hull territory polygons for offense/defense at a freeze-frame; sits behind dots. Mode: Offense/Defense. Uses the freeze-frame data.
4. `formation` — declared formation + tactical-shift slot positions. Team-specific. Data: nodes `[num, name, x(0–100), y(0–100), passCount]`.
5. `progressiveMap` — progressive pass/carry arrows on the full horizontal pitch; encodes completion + progression. Team-specific. Modes: Passes/Carries/All. Data: `{ x1,y1,x2,y2, c:0|1, t:'pass'|'carry' }`.
6. `eventScatter` — general event scatter; markers at (x,y), arrows for pass/carry/shot. Modes: All/Pass/Shot. Data: `{ x, y, t:'pass'|'carry'|'shot'|'duel'|'recovery' }`. Color map: pass `#F43F5E`, carry `#5B8AC0`, shot `#C77D0A`, duel muted, recovery `#3F7A5B`. Shots drawn as rotated squares.
7. `playAnimation` — time-windowed ball-path animation with play/pause/scrub, composed on a horizontal pitch. Data: ball track `[[x,y], …]`; prototype uses a synthetic track across the three goal build-ups.

**Shots**
8. `shotMap` — shot scatter on a half-pitch; circle area = xG, color = outcome. Team-specific. Hover tooltip. Data: `{ p:player, m:minute, xg, o:'goal'|'saved'|'off'|'blocked', x, y }`. Encodings: goal = filled accent + solid stroke; on-target(`saved`) = soft fill + solid stroke; off/blocked = no fill + dashed stroke. Radius `5 + xg*40`.

**Network & shape**
9. `passNetwork` — substitution-windowed directed pass network; node size = pass count, edge width = pair count. Team-specific. Data: nodes `[num,name,x,y,passCount]`, edges `[fromIdx, toIdx, weight]`.
10. `teamShape` — empirical in-possession nodes + out-of-possession density cloud. Team-specific. Modes: In poss. (convex hull of outfield nodes + centroid cross) / Out poss. (blurred density blobs pulled deeper).

**Heat surfaces**
11. `heatmap` — player on-ball KDE density surface. Data: normalized grid (prototype 8 rows × 6 cols, values 0–1); rendered as opacity-scaled cells of the accent color beneath pitch markings (vertical full pitch).
12. `xtSurface` — Karun Singh open xT grid as a heatmap beneath pitch markings (horizontal full pitch). Data: `{ rows:8, cols:12, values:[[…]] }`; opacity uses `sqrt(v/max)`. Peak at the attacking goal mouth.

**Bars & tables**
13. `matchStats` — match-level stat table (shots, on-target, xG, possession, passes, pass acc., corners, fouls). Mirrored home/away bars. Data rows: `{ l:label, h:homeVal, a:awayVal, f:'int'|'f2'|'pct' }`. Home bars `#F43F5E`, away bars `#5B8AC0`, centered label column.
14. `comparisonBars` — the generic, football-agnostic mirrored bar chart that `matchStats` wraps. Same row shape, subset of rows.

**Time series**
15. `timelineStrip` — single-possession elapsed-seconds strip; real-time axis, events alternate above/below the line, near-simultaneous events stack. Data: `{ t:seconds, ev:'Recovery'|'Pass'|'Carry'|'Shot', pl:player }`. Same event color map as eventScatter.
16. `momentumChart` — per-minute xT-based attacking momentum curve (or bars) with goal markers. Modes: Curve/Bars. Hover readout. Above the baseline = Spain (`#F43F5E`), below = England (`#5B8AC0`). Goal markers: dashed vertical line + dot + minute label at the baseline.

### Stage sizing (modal)
- `pitch` vertical → `420×560`. Tall pitch components (`pitch` other, `freezeFrame`, `convexHull`, `formation`, `teamShape`, `passNetwork`) → `440×560`. `shotMap` (half-pitch) → `460×400`. Everything else → `620×400`. Horizontal-pitch components compute height ≈ `width × 0.66`.

## Design Tokens
Base tokens live in `tokens.globals.css` (Tailwind v4 CSS-first, the site's real palette). The dark cockpit palette used by this explorer:

| Token | Value | Use |
| --- | --- | --- |
| bg | `#1A1613` | gallery panel / modal stage bg |
| surface | `#211D18` | modal panel |
| elev | `#2A2521` | thumbnails, code/data boxes, row hover |
| border | `#34302A` | hairlines, row dividers |
| bstrong | `#403A32` | panel outer borders |
| text | `#F5F0E6` | primary text |
| muted | `#A39E95` | blurbs, secondary |
| faint | `#78716C` | labels, counts |
| focal (Spain) | `#F43F5E` | accent, home team |
| focal soft | `rgba(244,63,94,0.17)` | active tint, area fills |
| navy (England) | `#5B8AC0` | away team accent |
| navy soft | `rgba(91,138,192,0.16)` | away tint |

Other encoding colors: shot/other `#C77D0A` (amber), recovery `#3F7A5B` (green).

**Typography**
- Display: **Fraunces** (900 for the page H1, 600 for the modal title), `font-variation-settings: "opsz" 144`.
- UI / body: **Geist** (400–700).
- Mono / labels / code: **Geist Mono** (400–600).
- Scale (px): H1 34; modal title 22; section labels 11 uppercase (`0.1–0.12em`); row name 13.5; blurb 12–13; code 11.5; data 10.5; tags 10–11.
- Radii: cards/panels 16; boxes 8; thumbnails 7; chips/toggles 4–5. Line rules 1px.
- Shadows: gallery `0 40px 90px -50px rgba(0,0,0,0.7)`; modal `0 50px 120px -40px rgba(0,0,0,0.6)`.
- Keyframes: `ovIn` (overlay fade 0.2s), `pnlIn` (panel fade+scale+rise 0.28s `cubic-bezier(0.2,0.8,0.2,1)`).

## Assets
- Fonts: Fraunces, Geist, Geist Mono — Google Fonts (already used by the site). No image assets; all charts are SVG/d3.
- Data: UEFA Euro 2024 Final, StatsBomb open-data match `3943043`. In production, source real events/360/xT via the `football-analytics` extractors rather than the prototype's inlined sample.

## Suggested implementation in the real app
- Reuse `lib/components.ts` (the 16-entry registry) as the source of truth for key/category/blurb/code — extend entries with the `controls` (sides, modes) and `stageSize` metadata described above.
- Build a `<ComponentLibrary>` page that groups registry entries with `lib/sections.ts` categories and renders the dark index rows; each row's thumbnail and the modal stage both mount the real footballd3 component (small vs. full size).
- Reuse / extend `components/showcase/ComponentCard.tsx` + `ComponentPreview.tsx`; add the modal, the segmented controls, playback, and the hover readouts.
- Feed the Euro 2024 Final dataset once at the page level and pass the relevant slice to each component.

## Files in this bundle
- `Component Library.dc.html` — the interactive prototype (reference only; not shippable).
- `support.js` — the prototype's runtime (reference only; not shippable).
- `tokens.globals.css` — the site's real design tokens.
- `README.md` — this document.
