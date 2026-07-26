# Handoff: Match Dashboard Redesign (Euro 2024 Final)

## Overview
A redesign of the football **Match Dashboard** (`app/football/dashboard`) for the analytics
portfolio. It presents a single match — **UEFA Euro 2024 Final, Spain 2–1 England** — using a
**Team · Center · Team** three-column spine. The redesign's goals were: (1) stronger visual
hierarchy, (2) charts that fit and have room to breathe (the original footballd3/Next.js
components overflowed the page), and (3) more interactivity (segmented toggles, hover detail,
scrubbing).

Three directions are included on one canvas, newest-decisions-first, referenced by id:
- **1A · Broadcast** — spacious, editorial, light theme. **This is the chosen direction — build this one.**
- **1B · Cockpit** — dense, dark analytics theme (reference only).
- **1C · Momentum-led** — narrative, momentum band as hero (reference only).

Only **1A** is fully specified below. 1B/1C exist as alternative treatments; reuse the same
components and data with the theme/size overrides noted at the end.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype that
shows the intended look and behavior. They are **not** production code to copy directly. The
prototype is authored as a "Design Component" (`.dc.html` + a runtime `support.js`); that runtime
is a prototyping harness, **not** something to ship.

The task is to **recreate this design in the target codebase** — the existing Next.js app under
`app/football/dashboard`, reusing its established patterns (React components, its charting
approach, its styling system). Treat the HTML/SVG chart drawing here as a spec for geometry,
scale, and interaction — reimplement with the codebase's real StatsBomb data and its chart
library (footballd3 / d3), not by pasting this SVG code.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, layout, and interactions are all specified.
Recreate 1A pixel-accurately using the codebase's libraries. All chart *data* in the prototype is
an illustrative sample — wire the real match dataset (StatsBomb match `3943043`) in its place; the
prototype's hardcoded numbers below are placeholders to match visually, not sources of truth.

---

## Screens / Views

There is one screen: the **Match Dashboard (1A)**. It is a vertical stack inside a rounded card
container.

### Container
- Max content width **1180px**, centered. Card: `background #FAF7F0`, `border 1px solid #D6D3CC`,
  `border-radius 16px`, `box-shadow 0 40px 90px -50px rgba(23,23,23,0.55)`, `overflow hidden`.
- Inner padding **26px 30px 30px**.
- Font families: **Fraunces** (serif, display/titles), **Geist** (sans, body), **Geist Mono**
  (labels, numbers, axes). Load from Google Fonts (weights below in Design Tokens).
- The `.wonk` display treatment on big Fraunces numerals/titles uses
  `font-variation-settings: "opsz" 144`.

### 1. Match Header (hero)
- Own card: `background #FFFDF8`, `border 1px solid #E5E5E5`, `border-radius 14px`,
  `padding 24px 28px`, `margin-bottom 20px`.
- Top row (space-between): left — `UEFA Euro 2024 · Final` (Geist Mono, 11px, letter-spacing
  .14em, uppercase, `#9F1239`). Right — `Olympiastadion, Berlin` / `14 Jul 2024` (Geist Mono,
  11px, `#8A8578`, right-aligned).
- Center scoreline row (flex, centered, gap 40px):
  - Left team block (right-aligned): **Spain** (Fraunces 900, 32px) + `xG 1.62` (Geist Mono 11px, `#8A8578`).
  - Score: Fraunces 900, 48px. `2` in `#9F1239`, en-dash `–` in `#8A8578` at 27px, `1` in `#1E3A5F`.
  - Right team block (left-aligned): **England** (Fraunces 900, 32px) + `xG 0.71`.
- Below the score: a **match timeline** SVG (full width, ~70px tall) — horizontal axis 0'→90'
  with ticks at 0/15/30/45/60/75/90, and goal markers as stems + dots + labels. Spain goals sit
  above the axis in `#9F1239`; England goals below in `#1E3A5F`. Goals: `Williams 47'` (ESP),
  `Palmer 73'` (ENG), `Oyarzabal 86'` (ESP).

### 2. Three-column grid
`display: grid; grid-template-columns: 1fr 360px 1fr; gap: 18px; align-items: stretch;`
(align-items **stretch** so all three cards are equal height — required.)

Each column is a card: `background #FFFDF8`, `border 1px solid #E5E5E5`, `border-radius 14px`,
`padding 20px 22px`. **The center card is `display:flex; flex-direction:column`** so its bottom
strip can grow.

Every card is split by a horizontal **divider** (`border-top 1px solid #E5E5E5`,
`padding-top 14px`, `margin-top 16px`). **These dividers must align horizontally across all three
cards** (see "Divider alignment" under Interactions). Upper region default height **226px**.

#### Left column — Spain (in possession)
- Header (space-between, align-items flex-start): left — `SPAIN` (Geist Mono 11px uppercase
  letter-spacing .1em, `#9F1239`) over **In possession** (Fraunces 600, 19px). Right — a
  **segmented toggle**: `Formation | Pass Net | Shape`.
- Upper region: the selected team chart (see Components → Team chart), height 226px.
- Below divider: `SHOT MAP · XG` label (Geist Mono 11px uppercase, `#8A8578`) + **shot map**
  (attacking-half pitch with xG-scaled shot bubbles). Focal color `#9F1239`.

#### Center column — Match ("Story of the game")
- Header: `MATCH` over **Story of the game** (Fraunces 600, 19px), plus a toggle
  `Stats | Momentum | Goals`.
- Upper region (fixed 226px, content vertically centered, `overflow:hidden`): the selected center
  view — **Match Stats** (default), **Momentum**, or **Goals**.
- Below divider (this section is `flex:1`, `min-height:160px`, so it fills to the bottom of the
  stretched card): `CUMULATIVE XG · RACE` label + `always on` note, then the **cumulative xG race**
  chart, always visible regardless of the toggle. Its SVG stretches to fill remaining height
  (`preserveAspectRatio: none`, viewBox `0 0 316 200`).

#### Right column — England (in possession)
- Mirror of the left column. Accent/focal color **navy `#1E3A5F`**. Toggle defaults to `Pass Net`.

### 3. Footer
- Divider, then space-between row: left — a 16px `#9F1239` rounded square + `Data provided by
  StatsBomb` (Geist Mono 12px, `#525252`; "StatsBomb" is an underlined link to
  https://statsbomb.com). Right — `Euro 2024 Final · match 3943043 · sample dataset` (Geist Mono
  11px, `#8A8578`).

---

## Components

### Segmented toggle
Row of buttons, `-1px` negative left-margin so borders collapse; outer corners rounded 4px.
- Inactive: `border 1px solid #E5E5E5`, `background transparent`, text `#525252`.
- Active: `border 1px solid #9F1239`, `background rgba(159,18,57,0.13)`, text `#9F1239`, raised z-index.
- Geist Mono 10.5px, weight 500, padding `4px 8px`, `white-space:nowrap`, `cursor:pointer`.
- Team toggles: `Formation | Pass Net | Shape`. Center toggle: `Stats | Momentum | Goals`.

### Team chart (three modes; drawn on a vertical full-pitch, accent = team color)
Pitch: navy strokes at 50% opacity on the light theme, rounded outer rect, halfway line, center
circle, both penalty + 6-yard boxes.
- **Formation**: 11 numbered player dots (radius ~ pitch·0.032) at formation positions, jersey
  number in white Geist Mono, player surname below in `#8A8578` (surnames shown in 1A).
- **Pass Network**: nodes sized by pass volume; edges weighted by pass count at ~38% opacity.
- **Team Shape**: convex hull of the outfield 10 filled with the team's soft tint
  (`rgba(159,18,57,0.13)` / `rgba(30,58,95,0.12)`), player dots, and a small centroid cross.

### Shot map (attacking-half pitch)
- Half-pitch with goal, penalty box, 6-yard box, penalty spot, D-arc.
- One circle per shot, **radius = 5 + xG·40** (scaled by the `shotScale` tweak). Goal = filled
  accent + solid accent stroke; on-target/saved = soft-tint fill + accent stroke; off/blocked =
  no fill, `#525252` dashed stroke (`3 2`).
- Hover a shot → readout line: `<player> · <min>' · xG <x.xx> · <outcome>` in accent color.
  Default readout: `<n> shots · <g> goals · xG <sum>`.

### Match Stats (center, default view)
Eight diverging rows. Grid per row: `44px 1fr 88px 1fr 44px` (Spain value · Spain bar ·
centered label · England bar · England value), gap 9, row gap 13.
- Spain values/bars `#9F1239`; England `#1E3A5F`; label Geist Mono 10px uppercase `#8A8578`.
- Bars: height 8px, `border-radius 4px`, width proportional to each side's share of the row total
  (Spain bar right-aligned, England left-aligned).
- Rows (Spain / England): Shots 16/8 · On target 5/3 · xG 1.62/0.71 · Possession 65%/35% ·
  Passes 619/331 · Pass acc. 89%/78% · Corners 4/2 · Fouls 12/15.

### Momentum (center view)
Diverging bar-per-2-minutes "attacking threat / xT per minute": Spain bars up in `#9F1239`,
England bars down in `#1E3A5F`, centered on a baseline; goal markers as dashed verticals + dot +
minute label. Hover → `<min>' · <team> threat <±x.xx>`. Legend chips for both teams. (In the
prototype the series is synthesized; use the real xT-per-minute series.)

### Goals (center view)
Chip row of the three goals; selecting one shows its build-up as a dashed polyline of positions
on the attacking half, ending in a highlighted finish with a halo. A **range slider** scrubs
through the pass/carry steps of the selected goal. Readout: `<scorer> <min>' · assist <x> · xG
<x.xx> · <team>`. Goals: Nico Williams 47' (assist Yamal, xG 0.22, ESP); Cole Palmer 73' (assist
Bellingham, xG 0.14, ENG); Mikel Oyarzabal 86' (assist Cucurella, xG 0.35, ESP).

### Cumulative xG race (center, always-on strip)
Stepped step-after line of running xG for each team across 0'→96': Spain `#9F1239`, England
`#1E3A5F`. Horizontal gridlines with y labels; goal markers dropped on the relevant team's line
(dashed vertical + minute + dot). Crosshair on mouse-move → both teams' cumulative value at that
minute; readout `<min>' · Spain <x.xx> — England <x.xx>`; default readout shows full-time totals.
SVG stretches (non-uniform) to fill the flexed bottom of the center card.

---

## Interactions & Behavior
- **Toggles**: each of the three columns has an independent toggle controlling its upper region.
  Team columns switch Formation / Pass Network / Team Shape; center switches Stats / Momentum /
  Goals. No animation required beyond an instant swap.
- **Shot hover**: hovering a shot bubble updates that column's readout line (and only that
  column's). Clears on mouse-leave.
- **Momentum hover**: hovering the timeline updates the momentum readout with the minute and
  signed threat value.
- **xG race crosshair**: mouse-move over the chart snaps a vertical scan line to the nearest
  minute and shows both teams' cumulative xG at that point.
- **Goal scrub**: chips select a goal; the range slider (`accent-color` = scoring team) advances
  the build-up polyline step by step; last step draws a halo on the finish.
- **Divider alignment (important)**: the horizontal divider in all three columns must sit at the
  same Y. Achieved by (a) `align-items: stretch` on the grid, and (b) forcing every column's
  **upper region to the same fixed height** (`upperHeight`, default 226px) — team charts render at
  that height; the center's upper view is wrapped in a `height:226px; overflow:hidden; flex column;
  justify-content:center` box. The center card's below-divider strip is `flex:1` so it grows to
  the shared card height.

## Responsive / Mobile (2A — build this alongside 1A)
Desktop-first, mobile-friendly. Below **~720px** the three-column grid collapses to a
**single-column tabbed layout** (see the phone mock `2A`). The three columns become three
top-level tabs; one full-width panel shows at a time. Everything else (charts, toggles, readouts,
scrubbers) is reused unchanged — only the container and the shot/team-chart dimensions change.

Layout on mobile (content width ~342px inside a standard phone viewport):
- **Sticky match header** pinned to the top of the scroll area: competition label, compact
  scoreline (`Spain 2 – 1 England`, Fraunces 900 ~34px, team names ~21px, xG under each), and the
  goal **timeline** SVG. Use a subtle bottom fade so content scrolls under it.
- **Top tab bar** (below the header, not sticky): a 3-up segmented control
  `Spain | Match | England`, min touch height **44px**, equal columns, `gap 6`. Active tab tinted
  in that column's color (Spain `#9F1239`, Match neutral `#171717`, England `#1E3A5F`).
- **Active panel** in a single `#FFFDF8` card (`border 1px solid #E5E5E5`, radius 14, padding
  ~16px):
  - **Spain / England tab** → team kicker + "In possession" title + Formation/Pass Net/Shape
    toggle; the team chart at full width (~342×300); divider; `SHOT MAP · XG` + shot map (~342×250).
  - **Match tab** → "Story of the game" + Stats/Momentum/Goals toggle; the selected center view;
    divider; `CUMULATIVE XG · RACE` (always on) at ~342×200.
- **Footer**: centered StatsBomb attribution.
- **Touch**: all desktop hovers (shot readout, momentum readout, xG crosshair) map to tap/drag;
  the goal scrubber slider and xG-race crosshair already work with touch/drag.

Implementation note: the same React components render both layouts. Drive the split with a media
query / container query at ~720px — 3-column grid above, tabbed stack below — rather than
duplicating the charts. The prototype exposes this as tab state `mTab` (`home|match|away`) plus
per-tab `view` keys (`m_home`, `m_away`, `m_center`).

## State Management
Per-column view selection and transient hover/scrub state:
- `view`: `{ home, center, away }` selected toggle keys (defaults: home=`formation`,
  away=`passnetwork`, center=`stats`).
- `hover`: keyed by column → hovered shot (or null).
- `mom`: keyed by column → hovered momentum bar; plus an `_xg` key per column for the xG-race
  crosshair minute.
- `goalSel` / `goalStep`: selected goal index and current scrub step.
Data fetching: load the StatsBomb match dataset (`3943043`) — lineups/positions, pass events
(for network + shape), shots (with xG, outcome, location), goal build-up sequences, and an
xT-per-minute momentum series. All rendering derives from that.

## Design Tokens (1A · Broadcast, light)
Colors:
- Page/desk: `#EDEAE3`
- Card bg (outer): `#FAF7F0`; surface (inner cards): `#FFFDF8`; elevated: `#FFFFFF`
- Border: `#E5E5E5`; strong border: `#D6D3CC`
- Text: `#171717`; muted: `#525252`; faint: `#8A8578`
- Focal (Spain / primary): `#9F1239`; focal soft: `rgba(159,18,57,0.13)`
- Navy (England / secondary): `#1E3A5F`; navy soft: `rgba(30,58,95,0.12)`
- Pitch strokes: `#1E3A5F` at ~50% opacity

Typography:
- Fraunces (opsz 9–144, weights 400/600/900) — display, team names, scoreline, card titles
- Geist (400/500/600/700) — body/sans
- Geist Mono (400/500/600) — labels, numbers, axes, toggles, readouts

Radii: cards 14–16px; buttons/chips 4–5px; bars 4px.
Shadow (container): `0 40px 90px -50px rgba(23,23,23,0.55)`.
Spacing: card padding 20–28px; grid gap 18px; column gap 40px (scoreline); row gap 13px (stats).

### Tweakable props (exposed in the prototype; expose as component props)
- `alignDividers` (boolean, default true) — force the three dividers level.
- `upperHeight` (number, default 226, range 200–320px) — shared upper-region height / divider Y.
- `shotScale` (number, default 1, range 0.6–1.6) — multiplier on shot-bubble radius.

## Assets
None. All graphics are inline SVG (pitches, charts, timeline) — reimplement with the codebase's
chart library. Fonts come from Google Fonts. StatsBomb attribution text + link are required.

## Alternative directions (1B / 1C) — reference only
Same components and data; overrides:
- **1B Cockpit (dark)**: bg `#1A1613`, surface `#211D18`, border `#34302A`/`#403A32`, text
  `#F5F0E6`, muted `#A39E95`, faint `#78716C`, focal `#F43F5E`, navy `#5B8AC0`, pitch strokes
  `#5B8AC0`. Denser: width 1060, grid center track 300px, smaller charts, compact scoreline bar,
  full-width momentum band, no player surnames.
- **1C Momentum-led (light)**: same light palette; width 1240; a full-width **momentum band** is
  the hero above the grid; center toggle is only `Stats | Goals` (momentum lives in the band).

## Files
- `Match Dashboard Redesign.dc.html` — the prototype (all three directions; build **1A**). Contains
  the template markup and the logic class (`renderVals()` builds every chart; search for
  `xgRaceEl`, `shotsEl`, `momentumEl`, `statsEl`, `goalsEl`, `teamChart`, `toggleEl`,
  `timelineEl`).
- `support.js` — the prototyping runtime only. **Do not ship**; reference for how the `.dc.html`
  boots if you want to open it locally.
- Original source being replaced: `app/football/dashboard/page.tsx` and
  `components/charts/*` in the repo.
