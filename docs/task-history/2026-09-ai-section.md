---
title: AI section and match-summary showcase
status: done
started: 2026-08-31
completed: 2026-10-15
repo: tylermartins.com
area: app/ai
related_prs: [20, 21, 22, 23, 26]
related_docs: [../specs/ai-section-spec.md, ../../../football-analytics/docs/task-history/2026-08-match-summary-module1.md, ../../../football-analytics/docs/task-history/2026-09-module2-sampling-and-comparison.md]
tags: [ai-section, match-summary, spec-kit, showcase]
---

# AI section and match-summary showcase

## Summary

A new top-level `/ai` section showing the `football-analytics` repo's
auto-written match summary (see that repo's Module 1/Module 2 docs) as a
real feature on the site, not just a backend artifact — after one false
start (a footballd3-component version, added then rebuilt), landing as
native React. Spec Kit scaffolding was added partway through this window
too, in its own PR, and a later PR surfaced the Module 2 model/effort
comparison on the page itself once that work landed on the sibling repo.

## Context

Everything the `football-analytics` repo's `ai/match_summary/` project
produces (outcome section, tactics prose, the model/effort comparison) had
existed only as JSON and Markdown in that repo. This task is where it
became something a site visitor could actually see.

## What was done

### 2026-08-31 — a modal, then a rebuild (PR #20)

Added a Match Summary modal to the football dashboard as a `footballd3`
component, then — same PR — rebuilt that content as native React instead,
on the view that the content (text sections, not a chart) didn't suit a
D3 component the way the rest of the gallery does.

### 2026-09-12 — Spec Kit scaffolding (PR #21)

Added the `.specify/` tree and the ten `speckit-*` skills (same stock
templates as the sibling repo — see its
`docs/task-history/2026-09-spec-kit-scaffolding.md`). `.specify/memory/
constitution.md` was never filled in here either.

### 2026-09-18 — the AI section itself (PR #22)

`docs/specs/ai-section-spec.md` (pre-existing in this repo, written for
this task, not yet committed to git as of this documentation pass) is the
actual spec for what shipped: the `/ai` section layout, nav/IA, and the
`/ai/match-summary` showcase page content outline. Built per that spec.

### 2026-09-15 — one immediate follow-up (still part of PR #22's lineage)

`Sync refreshed match summary and fix stale disclaimer` (`c509c7d`) — a
same-week fix keeping the showcase in sync with a small regeneration on
the sibling repo's side. Merged to `main` along with everything above.

### 2026-09-21 → 2026-09-22 — sync to the Module 2 routing decision (PR #23)

Surfaced the sibling repo's Module 2 model/effort comparison (see its
`docs/task-history/2026-09-module2-sampling-and-comparison.md`) on the page
itself, not just the chosen output: synced the match summary to the
chosen routing and updated its disclaimer (`0904b9a`), showed the model
and effort comparison on the page (`fea504b`), showed each comparison
run's actual generated content in tabs (`91bae8a`), then unified the match
summary into one tabbed component, dropping the now-redundant separate
run list (`f1ee85f`). Branch `feature/match-summary-routing`, merged via
PR #23.

### 2026-10-15 — sync to DATA-SPEC-v2 Part 5 (PR #26)

The sync this doc's Outcome section (below, as of the previous pass)
flagged as still ahead: copied the sibling repo's Part 5 output — the
tactics section now runs on a deterministic findings layer instead of
free prose, re-verified three times against the live API with no
recurrence of the eight previously known defects — into
`data/football/match_summary_3943043.json`, and rewrote
`MatchSummaryContent.tsx`/`MatchSummaryTabs.tsx`'s hardcoded disclaimer
text to match (both issue lists are now empty; the old two errors no
longer appear in this text). The five comparison-cell tabs are untouched
— they come from `compare_models.py`, unmerged on the sibling repo's
`feature/match-summary-model-effort` branch, out of scope for this sync.

## Outcome

Done and live: `/ai` and `/ai/match-summary` are real routes, including
the Module 2 comparison surfaced in PR #23, now showing DATA-SPEC-v2
Part 5's findings-layer output as of PR #26. **Still not synced:** the
five comparison-cell tabs, which won't reflect the findings layer until
`compare_models.py` is re-run against it on the sibling repo's side.

## Where to look for more

- `docs/specs/ai-section-spec.md` — the actual spec for this section
  (pre-existing, left as-is — see this folder's `README.md`).
- `../../../football-analytics/docs/task-history/2026-10-data-spec-v2-tactical-findings.md`
  — the sibling-repo work this page now reflects (Parts 0–5).
- `app/ai/`, `components/charts/MatchSummary*` — the code.
