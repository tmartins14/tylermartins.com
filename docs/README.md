# docs/

This repo's task history lives in `specs/` — one doc per body of work,
following `specs/TEMPLATE.md` (mirrored from the `football-analytics`
repo; if you change the template, change it in both repos in the same
commit, the way `DESIGN.md`/`~/dev/context/style.md` are already kept in
sync). Start at `specs/README.md` for the index.

## Where to start

- **Human, wants the lay of the land:** `specs/README.md`'s index table,
  then the doc(s) for whatever you're curious about.
- **Agent, asked a question about this repo's history:** same — start at
  `specs/README.md`, not by grepping git log. Read a task doc's Summary
  and Outcome first; follow its "Where to look for more" links only if you
  need the authoritative source.
- **Either, wants to know how something works today** (not how it got
  that way) — this repo doesn't have a `football-analytics`-style
  `ARCHITECTURE.md`. Use instead:
  - root `README.md` — setup, and an embedded original design-brief/
    handoff doc for the site's structure.
  - root `DESIGN.md` — the current design-system reference (tokens, every
    named bug and its fix, conventions), synced with `~/dev/context/style.md`.
  - root `CLAUDE.md` — imports this project's context from `~/dev/context/`
    (`tylermartins.md`, `style.md`, `writing-style.md`,
    `tylermartins-progress.md`).

## What's *not* here

`specs/ai-section-spec.md` is a real, filled-in feature spec that predates
this folder's template — left exactly as it was, not reformatted, per
Tyler's call when this folder was set up. It's indexed in
`specs/README.md` alongside everything else.
