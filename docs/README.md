# docs/

Two kinds of document live here, for two different questions:

- **`specs/`**: *what's about to be built.* Drop a written spec here
  before handing it to an agent to plan and execute — see `specs/README.md`.
  Input, not output.
- **`task-history/`**: *what was done, when, and why, after the fact.*
  One doc per body of work, following `task-history/TEMPLATE.md`
  (mirrored from the `football-analytics` repo; if you change the
  template, change it in both repos in the same commit, the way
  `DESIGN.md`/`~/dev/context/style.md` are already kept in sync). Start at
  `task-history/README.md` for the index.

## Where to start

- **Human, wants the lay of the land:** `task-history/README.md`'s index
  table, then the doc(s) for whatever you're curious about.
- **Agent, asked a question about this repo's history:** same — start at
  `task-history/README.md`, not by grepping git log. Read a task doc's
  Summary and Outcome first; follow its "Where to look for more" links
  only if you need the authoritative source.
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
- **Tyler, about to hand an agent a new task:** write (or drop) the spec
  into `specs/` first — see `specs/README.md`.
