---
title: Site bootstrap and mobile dashboard tabs
status: superseded
started: 2026-07-16
completed: 2026-07-26
repo: tylermartins.com
area: app/
related_prs: [1, 2, 3]
related_docs: []
tags: [bootstrap, mobile, dashboard]
---

# Site bootstrap and mobile dashboard tabs

## Summary

The site's first six commits: `create-next-app` scaffold, the first page,
the match dashboard (consuming the then-brand-new `footballd3` package —
see `football-analytics`'s `docs/task-history/2026-06-footballd3-statsbomb-libraries.md`),
first deploy, then three small PRs making that dashboard usable on mobile
(tabbed layout, a missing Momentum view, a header-painting bug).

## Context

The very first commits for the site — nothing existed yet, including a
usable mobile layout for the one feature (the match dashboard) that had
landed.

## What was done

`Initial commit from Create Next App` (07-16) → `First commit. Page stood
up` → `Match Dashboard built` → `deploying site` → `test protection`
(07-16 → 07-24), all direct to `main`, pre-dating the PR workflow. Then
PRs #1–#3 (07-26, branch `mobile-dashboard-tabs`): tabbed mobile layout for
the dashboard, a fix for a missing Momentum view and short xG race on
mobile, and a fix for the active-tab toggle painting over the sticky
mobile header.

## Outcome

Superseded by the much larger Player Match Analysis build-out three weeks
later (see `2026-08-player-match-analysis-site.md`), which replaced this
dashboard's responsiveness approach entirely. Nothing from this task is
still load-bearing on its own.

## Where to look for more

- `git log --oneline 1120063..50e99a5` — the exact commit range.
