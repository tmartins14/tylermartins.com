---
title: "Design-system remediation: Tickets 1-4"
status: done
started: 2026-08-15
completed: 2026-08-18
repo: tylermartins.com
area: app/, components/, DESIGN.md
related_prs: [11, 12, 13, 14, 15, 16, 17, 18, 19]
related_docs: [../../DESIGN.md]
tags: [design-system, tokens, accessibility, a11y, content-model, bugfix]
---

# Design-system remediation: Tickets 1-4

## Summary

Four parallel ticket branches, all merged the same four days, that took
the site from ad hoc inline styling to a real token-based design system:
type/spacing/motion scales and a real tablet breakpoint tier (Ticket 1),
team-color/data-ink correctness (Ticket 2), accessibility and social
metadata (Ticket 3), and a proper content model with async-state handling
(Ticket 4) — plus five standalone bug-fix PRs that landed in the same
window. `DESIGN.md` (and its synced companion, `~/dev/context/style.md`)
exists because of this task; most of its postmortem-style sections are
this task's own bugs.

## Context

By mid-August the site had three separate features (dashboard, component
gallery, player match analysis) each independently reaching for arbitrary
Tailwind values and inline styles, with no breakpoint tier between mobile
and desktop, no accessibility pass, and no documented reasoning for any of
it. This task is where "that reasoning" got a name and a file.

## What was done

### 2026-08-15 — Ticket 1: foundations (PR #11)

Type, spacing, and motion token scales; hoisted layout constants; a real
tablet breakpoint tier (previously only mobile/desktop existed); the
`eslint-rules/no-arbitrary-design-values.mjs` drift-guard lint rule
banning arbitrary Tailwind values outside the token scale.

### 2026-08-15 — Ticket 2: data-ink and color law (PR #12)

Fixed a team-color flip bug, removed brand color from chart *data*
(reserving it for chrome), added the kit-color table and a heat-scale
convention — the rules `DESIGN.md`'s "Color & kits" section documents.

### 2026-08-15 — three standalone bug-fix PRs (#13, #14, #15)

A dedicated `text-score` token instead of clamping the dashboard's match
score to the hero's type scale (#13); fixed tablet-tier dashboard cards
stretching to the viewport instead of capping width (#14); fixed `cn()`
(the `tailwind-merge` wrapper) silently dropping custom type-ramp classes
when they collided with a default Tailwind class name (#15) — all three
documented in `DESIGN.md` as named, specific bugs, not folded into Ticket
1's generic description.

### 2026-08-15 — Ticket 3: accessibility and social metadata (PR #16)

Fixed faint-token contrast, added visible focus rings, ARIA roles/labels
on every chart panel, and OG image/icons/social metadata across every
route.

### 2026-08-15 — team-color hydration mismatch (PR #17)

A separate same-day fix: `resolvedTheme` from `useTheme()` isn't known on
the server, so reading it directly into JSX produces a server/client
mismatch for dark-theme visitors specifically — documented in `DESIGN.md`
as a named gotcha, not just fixed silently.

### 2026-08-15 → 2026-08-18 — Ticket 4: content model, async states, copy (PR #18)

A `concept` lineage field on content items, an async-state kit
(skeleton/error/empty, used anywhere a chart panel can be in a non-ready
state), real `publishedDate` backfill, a homepage-H1 revert after Tyler's
own review, a loading-skeleton responsive fix (collapsing to one column on
mobile), and a round of mobile popup/overflow fixes plus card cleanup on
the Player Match Analysis page specifically.

### 2026-08-15 → 2026-08-18 — footballd3 0.1.4 (PR #19)

Bumped `footballd3` to 0.1.4 for a dark-mode chart-background fix found
during this same remediation pass, and regenerated the lockfile against
the newly-published version.

## Key decisions

- **Every bug fixed in this window got written down in `DESIGN.md`, by
  name, with the fix** — not folded anonymously into "various fixes." The
  file's dense "what shipped, what broke, why, and the regression guard"
  style comes directly from this task's own pace: five independent,
  precisely-named bugs in one week.
- **A lint rule enforces the token scale going forward**, rather than
  relying on review to catch arbitrary values — `no-arbitrary-design-
  values.mjs`, added in Ticket 1, is still active.

## Outcome

Done; this is the current design system. `DESIGN.md` and
`~/dev/context/style.md` are kept in sync in the same commit whenever
either changes (a convention this task established, stated directly in
`DESIGN.md`'s own text) — this task doc doesn't restate their content, it
just says why they exist.

## Where to look for more

- `../../DESIGN.md` — the full, current design-system reference (tokens,
  every named bug, the regression guard for each).
- `~/dev/context/style.md` — the terse human-readable companion.
- `eslint-rules/no-arbitrary-design-values.mjs` — the drift-guard rule.
