---
title: Player Match Analysis page, and the footballd3-publish deploy gotcha
status: done
started: 2026-08-07
completed: 2026-08-10
repo: tylermartins.com
area: app/football/player-match-analysis
related_prs: [10]
related_docs: [../../../football-analytics/docs/task-history/2026-08-player-match-analysis.md]
tags: [player-match-analysis, footballd3, deploy, responsiveness]
---

# Player Match Analysis page, and the footballd3-publish deploy gotcha

## Summary

Built the Player Match Analysis page (lineup selector, scrubbable timeline
with a highlight reel, heatmaps, action feed) on top of the extractors and
footballd3 components added in the sibling `football-analytics` repo (see
its `docs/task-history/2026-08-player-match-analysis.md`), through a dense run of
review-fix commits, then hit and fixed the deploy problem that's since
become this repo's best-known gotcha: Vercel installs `footballd3` from
npm, not the local workspace symlink, so a library change isn't live until
it's published and the dependency bumped.

## Context

This is the Next.js side of the player-match-analysis feature the sibling
repo built the data/components for — the page that actually wires those
components together into a scrubbable match experience, and the first
time this repo needed a `footballd3` change to reach production rather
than just working in local dev.

## What was done

Added the page (08-07), then review-fix passes through Phases D–G:
breakpoint overlap and panel sizing, scrubber autoplay bugs, goal-mouth
ratio, highlight-reel rebuild, chip order and titles (08-07 → 08-08). One
of these — breakpoint overlap in the five pitch panels — is the exact task
`SPEC_TEMPLATE.md` in the sibling repo uses as its worked example: each
panel hardcoded `pxPerYard` instead of measuring its container, fixed with
a shared `useContainerWidth` hook (`ResizeObserver`, not just
`clientWidth`-on-mount) rather than touching the shared `footballd3/pitch`
module other consumers (including the legacy football-analytics
dashboard) also depend on.

Rebuilt the lineup-selector card (08-08), combined Timeline and Highlight
Reel into one card with shape-coded events (08-09), fixed a timeline
playback leak, a hydration mismatch, and three visual bugs (08-09),
team-colored every chart panel and wired the page into site navigation
(08-09), added a Timeline pace multiplier — 1×/2×/4× (08-09).

Then the deploy fix (08-10): the Vercel build was failing because
`footballd3` locally resolves through a workspace symlink into the
sibling repo's source, which Vercel never sees — it clones only this repo
and installs the real npm package. Fixed by publishing `footballd3@0.1.2`
and declaring the nine still-untyped modules so the build wouldn't choke
on missing types, then (same day) consuming the newly-published
`footballd3@0.1.3` and dropping a local module shim that had been papering
over the gap. Added `make verify-deploy` — a clean, symlink-free install
that fails locally the way Vercel would, run before every push since.

## Key decisions

- **A footballd3 fix belongs in the library, not a local shim**, even
  under deploy pressure — the 0.1.2 → 0.1.3 sequence is exactly "ship a
  workaround to unblock the build, then replace it with the real fix once
  the library itself is published," not stopping at the workaround.
- **`make verify-deploy` exists because "works locally" and "works on
  Vercel" are different claims** given the symlink-vs-npm difference —
  this task is where that gap first actually broke a build, not just a
  theoretical risk.

## Outcome

Done, and still load-bearing: `make verify-deploy` is still run before
every push (per `~/dev/context/tylermartins.md`), and the symlink-in-dev /
published-npm-in-prod split this task first hit is still exactly how
`footballd3` is consumed today (now at 0.1.4 — see
`2026-08-design-system-remediation.md`).

## Where to look for more

- `../../../football-analytics/docs/task-history/2026-08-player-match-analysis.md` —
  the data/components side of this same feature.
- `SPEC_TEMPLATE.md` (sibling repo root) — this task's breakpoint-overlap
  fix, as the template's worked example.
- `~/dev/context/tylermartins.md` — the deploy gotcha, as a standing
  instruction.
- `Makefile`'s `verify-deploy` target, `scripts/verify-deploy.sh`.
