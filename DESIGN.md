# Design System — tylermartins.com

The living reference for this site's design tokens and rules. This is the detailed,
in-repo companion to `~/dev/context/style.md` (terse human-readable intent, private
context repo). **The two are kept in sync** — whichever changes, the other gets updated
in the same commit. `app/globals.css` is the source of truth for actual values; if this
doc and `globals.css` disagree, `globals.css` wins and this doc is stale — fix the doc.

Built incrementally across the 4-ticket design remediation (`design-handoff-bundle.md`,
repo root). Sections below start as stubs where that ticket hasn't landed yet.

## Archetypes

Two page archetypes drive density and motion — not separate knobs, one axis:

- **Tool** pages (the two dashboards, the FootballD3 gallery): dense, functional motion
  only, chrome recedes.
- **Piece** pages (editorial concept surfaces): essay-scaffolded, editorial motion
  allowed. *Not built yet — don't create; just don't block it when it arrives.*

## Color law

**Warmth in the shell, precision in the ink.** Warm brand chrome in the frame;
disciplined, perceptually-honest color in the data. Brand color (`focal`/`secondary`,
full saturation) never encodes a team or a data value — it's frame/chrome only, and
chrome prefers the `-soft` variants. See "Color & kits" below for how team identity and
data-mark color actually work.

## Type

Every text node maps to one of these ramp tokens — no arbitrary `text-[Npx]` (a
lint rule enforces this, see "Drift enforcement" below). Defined in `app/globals.css`'s
`@theme` block as `--text-*` vars, so they're plain Tailwind utilities (`text-display-2`,
`text-mono-sm`, ...).

| Token | Size | Family | Use |
|---|---|---|---|
| `text-display-1` | `clamp(40px, 5vw, 56px)` | Fraunces (`.display` class) | homepage / section-landing hero H1 |
| `text-display-2` | 34px | Fraunces | Tool-page H1 (dashboards, gallery); popup player name |
| `text-display-3` | 24px | Fraunces | subsection headers; modal title; match-score line |
| `text-display-4` | 20px | Fraunces | ChartFrame title; card titles |
| `text-score` | 40px | Fraunces (`.display` class) | match-score "big number" (dashboard header) — fixed, not fluid; added post-launch when `display-1`'s viewport-scaled clamp read oversized in this compact widget context |
| `text-lg` | 16px | Geist Sans (default) | lede / intro paragraph |
| `text-base` | 14px | Geist Sans | default body |
| `text-sm` | 13px | Geist Sans | dense secondary; nav links; gallery row name/blurb |
| `text-mono-base` | 12px | Geist Mono (`font-mono`) | chip labels, prominent metadata, code blocks |
| `text-mono-sm` | 11px | Geist Mono | eyebrows, chart readouts, metadata — the dominant mono size |
| `text-mono-xs` | 10px | Geist Mono | reserve only — **never** the only carrier of information needed to *operate* a chart (an interactive control's label must be ≥ `mono-sm`); fine for read-only decorative/secondary text |

Family tokens (`font-display`/`font-body`/`font-mono`) exist too, but display text
almost always wants the `.display` class instead (adds weight 900 + optical size, not
just the family).

**`cn()` and custom ramp tokens — a real gotcha, already fixed once, don't reintroduce
it.** `lib/utils.ts`'s `cn()` wraps `tailwind-merge`, which only knows Tailwind's own
default scale. A truly custom class name (`text-display-2`, `text-mono-sm`, `text-score`
— not `text-lg/base/sm`, those already existed as default keys we override) sharing the
`text-` prefix with a *different* Tailwind group (text color) gets misclassified and
**silently dropped** by tailwind-merge whenever it's merged alongside a class from the
group it's mistaken for. This shipped as a real bug: every button using
`cn("text-mono-sm ...", isActive ? "text-focal" : "text-muted")` — the standard
ToggleGroup/DashboardTabBar pattern — rendered at the browser's inherited 16px, not
11px, because the color class silently won the (bogus) conflict. Fixed by registering
the custom scale with `extendTailwindMerge` in `lib/utils.ts`, once, for every call site
— **any new custom `@theme` class name that shares a Tailwind prefix with an existing
group must be added to that same `classGroups` config**, or it's just this bug again
under a new token name. Regression guard:
`e2e/dashboard-responsive.spec.ts`'s "type-ramp classes survive cn()" test — checks a
real rendered `getComputedStyle` value in a real browser, not just the class string.

## Spacing & layout constants

Arbitrary spacing (`p-[18px]`, `gap-[9px]`, ...) is banned by lint — Tailwind v4's
`--spacing` scale (`0.25rem` = 4px) resolves *any* multiplier written in the class name,
including quarter-steps (`p-2.25` = 9px, `py-5.5` = 22px), so every legacy value maps
exactly, not just approximately.

Named layout constants (breakpoints, widths, the pitch scale cap) live in `app/globals.css`'s
`@theme` block so they're defined once and referenced by name — never a bare literal:

| Token | Value | Governs |
|---|---|---|
| `--container-page` (`max-w-page`) | 1180px | Page shell: home, football landing, about, dashboard wrapper |
| `--container-pma` (`max-w-pma`) | 1390px | PlayerMatchAnalysis page shell (wider — roster + popup 2-col) |
| `--breakpoint-tablet` (`tablet:`) | 768px | Dashboard tablet tier floor — see "Responsive tiers" |
| `--breakpoint-dash` (`dash:`) | 1280px (80rem) | Dashboard desktop 3-col grid floor |
| `--breakpoint-pma` (`pma:`/`max-pma:`) | 1024px (64rem) | PlayerMatchAnalysis's own sidebar+content split |
| `--breakpoint-pma-md` (`pma-md:`) | 900px | PlayerMatchAnalysis popup body content grid → 2-col |
| `--breakpoint-pma-sm` (`pma-sm:`) | 560px | PlayerMatchAnalysis shots/pass-sonar sub-grid → 2-col |
| `--size-card-thumb` | 150px | Football landing page card thumbnail height |
| `--size-dashboard-center` | 360px | Dashboard center column width (used as `minmax(300px, this)`, not a hard value) |
| `MAX_PX_PER_YARD` (`lib/pitch-scale.ts`, not CSS) | 3.2 | Shared desktop-tuned pxPerYard cap for half-pitch views (Formation/ShotMap/PassNetwork/TeamShape/PlayAnimation). Full-pitch/goal-mouth views keep their own caps (4.4 / 1.25) since their aspect ratios differ. |

Custom `@theme` breakpoints in Tailwind v4 auto-generate both the `name:` (min-width) and
`max-name:` (below that width) variants from one definition — that's how `pma:`/`max-pma:`
replace the old paired `min-[1024px]:`/`max-[1023px]:` hack.

## Motion

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 120ms | Micro-interactions: hover/color transitions (`duration-[var(--motion-fast)]`) |
| `--motion-base` | 200ms | Structural reveals: modal/drawer open-close (`duration-[var(--motion-base)]`) |
| `--motion-slow` | 400ms | Reserved — larger/editorial transitions (Piece pages, not built yet) |
| `--ease-standard` | `cubic-bezier(0.2,0,0,1)` | Default — plain `ease-standard` utility |
| `--ease-out` | `cubic-bezier(0,0,0,1)` | Plain `ease-out` utility (overrides Tailwind's built-in keyword) |
| `--ease-in` | `cubic-bezier(0.4,0,1,1)` | Plain `ease-in` utility (overrides Tailwind's built-in keyword) |

Durations aren't a Tailwind-recognized *named* theme namespace (only eases are), so they're
referenced as `duration-[var(--motion-fast)]` — bracket syntax, but pointing at a token,
never a raw `ms` literal. Eases work as plain utility classes (`ease-standard`).

**Archetype motion budget:** Tool pages (dashboards, gallery) get functional motion
only — state transitions, scrubbing, hover. Piece pages (not built yet) get editorial
motion.

**Reduced motion:** a global `@media (prefers-reduced-motion: reduce)` rule in
`app/globals.css` collapses all transition/animation durations to `1ms` and disables
scroll-behavior smoothing. The one exception CSS can't reach — `PlayAnimationPanel`'s
frame-by-frame D3 tween lives inside `footballd3` (library-internal, tracked as `FD3-3`)
— gets a site-side accommodation instead: `prefers-reduced-motion` bumps its
`playbackSpeed` to effectively-instant rather than the normal 2×, so playback still
respects the preference without needing the library change.

**Drift enforcement:** `eslint-rules/no-arbitrary-design-values.mjs` fails `npm run lint`
on any new `text-[...]`, arbitrary spacing (`p-[...]`/`gap-[...]`/etc.), raw
`duration-[...]`, or raw `ease-[...]` inside a `className`. Exempted: `components/ui/**`
(vendored shadcn, not hand-tuned) and `StatsBombAttribution.tsx` (out of scope per the
handoff bundle — already systematized correctly).

## Responsive tiers

The match dashboard (Tool archetype) has three tiers, not the old binary mobile/desktop
split:

- **Mobile** (`<768px`, below `--breakpoint-tablet`): `MobileDashboardTabs` — one of
  Spain / Match / England visible at a time via a tab bar. Unchanged from before Ticket 1d.
- **Tablet** (`768–1279px`, `tablet:` and below `dash:`): all three cards
  (`tablet-dashboard-stack` testid) visible, no tab switcher, **width-capped**
  (`--size-tablet-card`, 420px) rather than full-bleed. Single column 768–899px; at
  `tablet-2col` (900px+) the two team cards sit side by side and the match card spans
  both. This is the genuine tablet design the bundle called out as missing.
  **First cut shipped full-bleed cards and was a real, reported regression**: a card's
  pitch/chart stays capped at its own desktop-scale size (`MAX_PX_PER_YARD`,
  `lib/pitch-scale.ts`) regardless of container width, so stretching the card to the
  viewport was pure wasted whitespace around a small pitch, tripled down the page —
  it read as both "too large" (disproportionate to the shrunken content next to it) and
  "doesn't fit the screen" (~2x the scroll height for no more actual content). Fixed by
  capping card width instead of the viewport dictating it. Grid tracks are plain `1fr`s
  with per-card `max-width`, not a content-sized `minmax()` track — that combination
  triggered a real ResizeObserver feedback loop with the pitch panels' own width
  measurement at exactly 1024px (where this tier's 2-col split and the site rail's
  `lg:` breakpoint coincide), hanging the page. Verified against a *specific* reported
  window size (1159×697), not just round numbers — see `e2e/dashboard-responsive.spec.ts`.
- **Desktop** (`≥1280px`, `dash:`): the 3-column grid. Center column is
  `minmax(300px, var(--size-dashboard-center))`, not a hard 360px, so it can yield space
  to the team columns right at the 1280px boundary — the tightest point given the site
  rail (240px at `lg:`) eating into content width.

`PlayerMatchAnalysis` has its own, independent set of tiers (`pma`/`pma-md`/`pma-sm` —
see the table above) for its sidebar+popup layout; it doesn't share breakpoints with the
match dashboard.

## Color & kits

**The rule:** every team-data mark (a bar, line, node, or pitch marker whose color
identifies *which team*) reads its color from `lib/kits.ts`'s `kitEncoding(side, mode)` —
never `focal`/`secondary` (brand chrome) and never a second, independently-maintained
hex literal. That's the fix for the flip bug (Ticket 2b: three panels had home=focal/
away=secondary, two had it backwards) and the fix for the color law leak (Ticket 2c:
brand rose was doubling as "team A" in five components).

**Kit table** (`lib/kits.ts`, StatsBomb carries no kit colors — this is an owned
dataset):

| Team | Kit | primary | accent | encoding (light) | encoding (dark) |
|---|---|---|---|---|---|
| Spain | home | `#C60B1E` | `#FFC400` | `#C60B1E` | `#E23744` |
| England | home | `#FFFFFF` | `#001E3C` | `#001E3C` (white is unusable as ink on the shell) | `#7FA8D6` |

Only `home` kits are seeded — the one match this site ships (`3943043`, per
`DEFAULT_MATCH_ID`) had both sides in their home kit. `away`/`third` slots exist on the
type but aren't required, unlike the handoff bundle's illustrative snippet — filling
them in would mean inventing colors with no source.

**`kitEncoding(side, mode, matchId?)`** is the one function every panel calls; `matchId`
defaults to `DEFAULT_MATCH_ID` since every current view renders exactly one match.
`kitChip(side)` returns the two-tone `{ primary, accent }` pair for the identity chip
(swatch + border) — `TeamColumnCard`'s team label is the reference implementation:
single-hue `kitEncoding` colors the data marks, the two-tone chip carries the full
identity, which is what makes England legible despite an unusable white primary.

**CSS-var mirror:** `--team-home`/`--team-away` in `app/globals.css` carry the same
values for the few pure-CSS/server components (`GoalTimeline`) that color by team
without a client-side theme hook. Keep these, `lib/kits.ts`, and `lib/chart-theme.ts`'s
`spain`/`england` fields (which now derive from `kitEncoding`, not their own literals)
in sync — same multi-copy pattern already used for `focal`/`secondary` between
`globals.css` and `chart-theme.ts`.

**Clash rule (2d):** `resolveMatchEncodings` drops the away side to its away/third kit
if ΔE (CIE76, `deltaE()`) falls below 20, then to a curated fallback pair
(`#0F766E`/`#C2410C`, proposed not locked) if still too close. Doesn't trigger for the
seeded match (Spain red vs. England navy is nowhere near the threshold) — it exists for
when a second match's kits actually clash.

**Heat scale (2f):** `HEAT_SCALE` (`lib/chart-theme.ts`) — a warm-anchored sequential
ramp (cream → amber/orange, light `#B45309` / dark `#F59E0B`), decoupled from team
identity. `TerritoryPanel`'s heatmap uses it; the hull outline and event markers on the
same chart stay team-colored (`kitEncoding`) since those *are* identity, not density.
Proposed endpoints, not locked.

**shotMap encoding (2e):** hue = team (`kitEncoding`), tier = outcome (`styleMode:
"tier"`) — `lib/components.ts`'s gallery blurb now says so; it used to claim
"color = outcome," which never matched what `ShotMapPanel` actually rendered.

**Kicker rule (2g):** `ChartFrame`'s `kickerColor` defaults to `muted`; `focal`/
`secondary` are reserved for non-data framing, never a chart that encodes real data.
Audited — nothing currently opts into either.

**Scope note:** the FootballD3 gallery (`components/showcase/ComponentStage.tsx`) still
renders team A/B demos in `focal`/`secondary` — deliberately out of scope for this pass
(not in the handoff bundle's file list; it's illustrative, not this-match-specific).
Selection/highlight accents (`PassSonarPanel`, `GoalMouthShotPanel`, `TimelinePanel`,
`PlayAnimationPanel`'s `actorColor`/`highlightColor`/`playedColor`) also still use
`focal` — read as "currently relevant," not team-identity, so treated differently from
the flip-bug fixes above. Flagged for review, not silently left out.

## `useTheme()` — a real hydration gotcha, bit the codebase twice

next-themes' `resolvedTheme` is `undefined` during SSR and the first client render —
it can't know the visitor's stored/system theme preference until a client effect
resolves it, so SSR always renders as if the theme were "light". Reading
`resolvedTheme` **directly into JSX** (an inline `style` color, a swatch `background`)
is a real hydration-mismatch bug for any dark-theme visitor: the server HTML says
light, the client's first render says dark, and React logs a mismatch and gives up
patching that whole subtree rather than "fixing it up."

This has shipped twice: first in `PlayerMatchAnalysisClient.tsx`, then — reported live
via a real console error, not caught in review — in `TeamColumnCard.tsx`'s team-name
label color and `MomentumBarPanel.tsx`'s legend swatch backgrounds. Both computed
`kitEncoding(side, mode)` from `resolvedTheme` directly at the top of the component and
rendered it unconditionally in JSX.

**The rule:** if a component reads `resolvedTheme` to compute something that renders
in JSX, gate it behind a `mounted` boolean flipped `true` in a `useEffect` (client-only,
never runs during SSR) — the first client render then matches the server's light
default exactly, and the real theme takes over on the next render, after hydration has
already settled. Same pattern in `TeamColumnCard.tsx`, `MomentumBarPanel.tsx`,
`PlayerMatchAnalysisClient.tsx`, and `ThemeToggle.tsx` (the original source of the
pattern). Every other chart panel only reads `resolvedTheme` inside a `useEffect`
driving D3's own imperative, client-only rendering — safe as-is, nothing to change
there.

**Not every theme-derived JSX usage needs the guard** — `ShotMapPanel`'s hover-readout
color is theme-derived but only renders behind `hover ? resolvedColor : "var(--faint)"`,
and `hover` is guaranteed `null` on both the server and the first client render, so
that branch can't diverge before hydration completes. Checked case by case, not
applied reflexively to every `useTheme()` call site.

**Regression guard:** `e2e/dashboard-responsive.spec.ts`'s "no hydration mismatch for
a dark-theme visitor" test — sets `localStorage.theme = "dark"` before the page's own
scripts run (via `page.addInitScript`, matching a real returning visitor) and asserts
no hydration-related console error fires. Proven to actually catch this class of bug
by reverting the guard and re-running.

## Accessibility

**Contrast.** `--faint` (used for the lightest body/caption text, e.g. match-metadata
captions and axis labels) was re-measured against every surface it actually sits on
and re-picked to clear WCAG 2 AA (4.5:1) with margin, not just against the page
background:
- Light: `#8A8578` → `#6B6656` (5.36–5.74:1 across surfaces)
- Dark: `#78716C` → `#948E80` (4.65–5.51:1 across surfaces)

Both are mirrored in `lib/chart-theme.ts` (`faint`) — kept in sync with
`app/globals.css`'s `--faint` deliberately, since chart labels and DOM text need to
read as the same color. Contrast was computed via the WCAG relative-luminance formula
against real rendered surface colors, not eyeballed.

**Focus visibility.** Added a global `:focus-visible` outline (`--focus-ring`, mapped
to `--focal`) in `app/globals.css`, placed in `@layer utilities` rather than
`@layer base` — Tailwind's own `outline-none` utility lives in `@layer utilities`, so
a same-layer override was required to actually win the cascade (verified against the
compiled CSS, not assumed). Real keyboard `Tab` navigation was used to trigger this
(`:focus-visible` doesn't fire from `.focus()` calls), confirmed with Playwright.

**Chart/SVG accessibility.** Every D3-rendered chart panel now carries either
`role="img"` + a computed `aria-label` (for panels that are genuinely just a picture —
formations, pass networks, team shape, shot maps, goal timelines) or `role="region"`
(for panels that contain real DOM text a screen reader should read directly, e.g.
`PlayerStatCardsPanel`, `ActionFeedPanel` — deliberately not `role="img"`, which would
hide that text). Panels with a live-updating hover readout (momentum, cumulative
xG/xT, goals-buildup) also carry `aria-live="polite"`. Toggle-style controls
(territory view chips, play/pause) carry `aria-pressed`. The match-stats comparison
rows use `role="table"`/`role="row"` with a computed per-row `aria-label`, since
they're not a real `<table>`.

**Known gap, not fixed in this pass:** the gallery item modal (Base UI `Dialog`,
`components/showcase/ComponentModal.tsx`) doesn't trap focus — `Tab` can escape from
the dialog to background content while it's open. Out of scope for this ticket (no
modal work was in the handoff bundle's file list); flagging it here rather than
leaving it silently undiscovered.

## Social & metadata

Every route now resolves real Open Graph / Twitter Card tags instead of Next.js
defaults, via `metadataBase` (`app/layout.tsx`, site's real domain — required for any
relative image URL in metadata to resolve at all).

**Important non-obvious behavior, confirmed against `node_modules/next/dist/docs`:**
metadata is only *shallowly* merged across nested route segments — a page that
exports its own `openGraph`/`twitter` object **replaces** the parent layout's
entirely, not per-field. It also does **not** inherit the root's file-convention
`opengraph-image.tsx` (confirmed empirically: a nested route with no `images` field
renders zero `og:image` tags, even though `app/opengraph-image.tsx` exists at the
root). So `/football/dashboard` and `/football/player-match-analysis` each repeat the
full set of fields they want — `url`, `siteName`, `locale`, `images: ["/opengraph-image"]`
— rather than relying on inheritance. Any new route that defines its own
`openGraph`/`twitter` object needs to do the same, or it'll silently lose the shared
image and site identity fields.

**OG image** (`app/opengraph-image.tsx`, 1200×630, shared across every route):
Fraunces-900 wordmark + a shot-map hero viz on the paper surface, in the same ink
discipline as the rest of the site (focal red / secondary navy, nothing else). Two
Google Fonts are fetched at render time (Fraunces for the headline, Inter for
subhead/footer) — **each registered under its own explicit name and referenced by
that name**, never the generic `"sans-serif"` keyword. Satori has no real fallback
for a generic family name; if a font family used anywhere in the tree isn't in the
`fonts` array, Satori resolves per-glyph against whatever *is* registered, patching
between that font and its own internal default. Confirmed by shipping this with only
Fraunces registered and the body text declared `fontFamily: "sans-serif"`: the
rendered text came out visibly mixed serif/bold, glyph by glyph, because the Fraunces
Google Fonts query was subset to only the headline's characters. Fixed by fetching a
second real font (Inter) and referencing both by name; each font's `text=` subset
param is scoped to exactly the string(s) that font renders, not shared across fonts.

`app/icon.tsx` (32×32) and `app/apple-icon.tsx` (180×180) replace the generic
Next.js default favicon/touch-icon with the same crimson-square "T" mark. Unused
default public assets (`public/{file,globe,next,vercel,window}.svg`,
`app/favicon.ico`) were deleted after confirming via grep they weren't referenced
anywhere.

## Content model

**Lineage (`concept` field, `lib/components.ts`).** `ComponentEntry` carries an
optional `concept` block — `name`/`source`/`link`/`summary`, where an idea came
from and what changed to make it practical. Unpopulated for now and **no render
surface exists yet** (deliberately deferred to a future Piece-page treatment) —
the field exists so lineage doesn't have to be retrofitted across 16+ components
later. New components may populate it; nothing currently reads it.

**Gallery sort dates.** All 16 components' `publishedDate` used to share one flat
placeholder (`2026-07-28`, the site-integration date), making the gallery's
newest-first sort a no-op. Backfilled with each component's real first-commit
date from `football-analytics`' git history
(`git log --follow --diff-filter=A -- src/footballd3/components/<name>`) — real
data, not fabricated. `publishedDate` is sort-order-only, never rendered as
visible text, so this only changed card order, not copy.

**Async state kit (`components/charts/AsyncState.tsx`).** One shared treatment
for any fetch-backed view, applied to `PlayerMatchAnalysisClient` (currently the
only async-fed page):
- `AsyncSkeleton` — pulsing blocks on `surface` (not `elevated` — a placeholder,
  not a raised card), loosely shaped like the real popup so the swap doesn't
  read as "the page changed." `animate-pulse` is stock Tailwind; the global
  `prefers-reduced-motion: reduce` rule already forces every animation-duration
  to 1ms sitewide, so no separate reduced-motion handling was needed here.
- `AsyncError` — one-line `muted` mono, for a genuine fetch failure.
- `AsyncEmpty` — same visual weight as `AsyncError` but distinct copy and
  semantics: a real, expected outcome (e.g. a substitute with 1-2 touches),
  never confused with a load failure. Threshold: fewer than 3 events for the
  full match (`NEAR_ZERO_EVENTS_THRESHOLD`).

**Real bug, already fixed, don't reintroduce:** `AsyncSkeleton`'s placeholder
grids first shipped as fixed `grid-cols-3`/`grid-cols-2`, with no responsive
breakpoints — on a phone-width popup the loading flash stayed multi-column and
squished, unlike the real `PopupBody` content underneath it, which collapses to
one column below `pma-sm`/`pma-md`. Reported live as "the responsive design is
broken." Any skeleton grid must use the same breakpoint tokens as the content
it's standing in for, not a bare `grid-cols-N` — checked by a real
`getComputedStyle().gridTemplateColumns` assertion at 390px in
`e2e/player-match-analysis.spec.ts`, not just an eyeballed screenshot.

**Homepage H1.** The bundle flagged "Data, made visual and interactive." as
generic (could be any data-viz portfolio) and offered three tightened
alternatives leaning into the site's translator spine — explicitly Tyler's call,
not auto-chosen. Reviewed and **kept as-is**: still "Data, made visual and
interactive." `app/layout.tsx`'s meta description ("Match data, turned into
tools.") is unaffected either way.

## Player Match Analysis — mobile popup fixes + card cleanup

Three real bugs found and fixed post-Ticket-4, reported live by Tyler testing the
dev build, not caught by any automated check beforehand — each is now covered by
a permanent regression test proven via revert-and-retest.

**Popup didn't actually cover the roster on mobile.** The mobile popup
(`components/charts/PlayerMatchAnalysisClient.tsx`) was `position: absolute`
relative to a wrapper `<div>` whose height collapsed to `0` the instant its only
child (the popup) left normal flow — its `top: 0` then landed wherever that
collapsed div naturally sat in the page (right after the roster above it), not
the true top of the viewport, leaving some of the roster visible above the
popup instead of hidden behind it. This predates Ticket 1 — confirmed by diffing
against the pre-remediation baseline (commit `326ce3f`) in a worktree, byte-for-
byte the same bug, just never noticed. Fixed with `position: fixed` +
`inset-0` below the `pma` breakpoint instead — anchors to the viewport itself, so
it can't be undermined by a parent collapsing; the old `scrollIntoView` timing
hack is gone entirely. Regression guard: `e2e/player-match-analysis.spec.ts`
checks `elementFromPoint` at the roster's own position resolves to the popup, not
just that the popup is "on top" by z-index.

**Popup content overflowed horizontally on mobile.** `PopupBody`'s chart-panel
grid/flex wrappers (Territory & events, Cumulative xT, Shots·xG, Pass sonar) had
no `min-w-0`. CSS Grid/flex items default to `min-width: auto`, refusing to
shrink below their content's intrinsic width — each chart panel measures its own
container via `useContainerWidth` (a `ResizeObserver`), so the wrapper and the
chart reinforced each other into a state wider than the actual track (118px of
overflow at 375px). **The page's own `scrollWidth` never showed this** — the
popup is `position: fixed`, excluded from `document.scrollWidth` — only checking
the *popup's own* `scrollWidth` vs `clientWidth` caught it. Any new panel added
inside `PopupBody` needs `min-w-0` on its wrapping grid/flex item, or this
recurs. Regression guard: same file, asserts `popup.scrollWidth - popup.clientWidth
<= 1` at 390px.

**Timeline + Match Contribution cards, cleaned up.** Not bugs — a design pass,
options proposed and picked by Tyler:
- Match Contribution stat cards (`.stat-card`, vendored
  `football-analytics/.../playerStatCards.js`) are now centered (label + value),
  not left-aligned. Found and fixed the same hardcoded-light-only-color gap as
  the earlier `goalMouthShotPanel.js`/`cumulativeXtChart.js` fix while in the
  file — `#8A8578` was literally the *stale* pre-Ticket-3c faint value.
- Timeline card: the speed (`1×/2×/4×`) and mode (`Highlights`/`All events`)
  toggles are grouped into one visual cluster (a divider between them, not two
  independent floating rows); a divider now separates the highlight-reel zone
  from the scrub-track zone in `TimelinePanel.tsx` (previously just a bare
  `gap-3`, reading as one blended block).
