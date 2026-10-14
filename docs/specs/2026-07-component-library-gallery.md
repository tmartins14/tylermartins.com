---
title: footballd3 component-library gallery and site copy pass
status: done
started: 2026-07-28
completed: 2026-07-31
repo: tylermartins.com
area: app/football, content/
related_prs: [4, 5, 6, 7, 8, 9]
related_docs: []
tags: [footballd3, gallery, content, copy]
---

# footballd3 component-library gallery and site copy pass

## Summary

Added a gallery page showcasing every `footballd3` component individually
(distinct from the match dashboard, which composes several of them), then
a run of site-wide copy and navigation cleanup: standardized naming
("FootballD3 Gallery," "Match Analysis Dashboard" — now in
`~/dev/context/writing-style.md`'s canonical-names list), simplified
Football nav, an About page, and moving page/chrome copy out of inline
JSX into typed `content/` modules paired with colocated MDX.

## Context

The match dashboard showed `footballd3` components composed together, but
nothing let a visitor see each component on its own, and page copy was
still inline JSX with inconsistent names for the same features.

## What was done

PR #4 (07-28): the component-library gallery itself. PR #5 (07-29): site
copy rewrite + naming standardization. PR #6 (07-30): defaulted both
dashboard team cards to Formation, simplified Football nav to a single
link. PR #7 (07-31): linkified the breadcrumb, added an About page,
dropped a Writing nav item, expanded the Football writeup. PR #8 (07-31):
moved page and chrome copy into typed `content/` modules + colocated MDX
— the pattern `app/football/`, `app/ai/`, etc. still use (a `content.mdx`
next to each route's `page.tsx`). PR #9 (07-31): a copy grammar fix.

## Outcome

Done. The gallery is still live (`app/football/components/`), the
typed-content + colocated-MDX pattern from PR #8 is still how every
section's copy is organized, and the canonical component/page names from
PR #5 are still enforced via `~/dev/context/writing-style.md`.

## Where to look for more

- `lib/componentLibraryData.ts`, `app/football/components/` — the gallery.
- `content/`, and any route's colocated `content.mdx` — the content
  pattern this task established.
- `~/dev/context/writing-style.md` — the copy-voice rules this task's
  naming standardization fed into.
