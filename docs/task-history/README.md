# Task index

One row per task doc in this folder, oldest first. Every doc follows
`TEMPLATE.md`'s format (mirrored from the `football-analytics` repo — see
that repo's `docs/README.md` for the full reference/specs/task-history
split this follows). `../specs/ai-section-spec.md` is a real written spec,
not a task-output doc — it lives in `../specs/`, not here; see this
folder's parent `README.md`.

| Task | Status | Dates | Area | Doc |
|---|---|---|---|---|
| Site bootstrap and mobile dashboard tabs | superseded | 2026-07-16 → 2026-07-26 | `app/` | [2026-07-bootstrap-and-mobile-dashboard.md](2026-07-bootstrap-and-mobile-dashboard.md) |
| footballd3 component-library gallery and site copy pass | done | 2026-07-28 → 2026-07-31 | `app/football`, `content/` | [2026-07-component-library-gallery.md](2026-07-component-library-gallery.md) |
| Player Match Analysis page, and the footballd3-publish deploy gotcha | done | 2026-08-07 → 2026-08-10 | `app/football/player-match-analysis` | [2026-08-player-match-analysis-site.md](2026-08-player-match-analysis-site.md) |
| Design-system remediation: Tickets 1-4 | done | 2026-08-15 → 2026-08-18 | `app/`, `components/`, `DESIGN.md` | [2026-08-design-system-remediation.md](2026-08-design-system-remediation.md) |
| AI section and match-summary showcase | done | 2026-08-31 → 2026-09-22 | `app/ai` | [2026-09-ai-section.md](2026-09-ai-section.md) |

## For an agent landing here cold

1. Scan the table above for the row closest to your question.
2. Read that doc's **Summary** and **Outcome** first — most questions stop
   there.
3. Follow **Where to look for more** only if you need the authoritative
   source (the actual code, PR, or `DESIGN.md`) rather than a summary.
4. The sibling repo (`football-analytics`) has its own `docs/task-history/`
   with the same template — several tasks here are cross-referenced from
   there and back (this site's AI section and the `football-analytics`
   DATA-SPEC-v2 work are two sides of the same feature).

See `../README.md` for how this folder relates to `DESIGN.md`, the root
`README.md`'s embedded design brief, `CLAUDE.md`, and `../specs/`.
