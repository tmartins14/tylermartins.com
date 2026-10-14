# SPEC — AI Section + Match Summary Showcase

<!--
INTERVIEW PATTERN (fill before executing):
- One-line goal — what does "done" look like?
- Files/interfaces touched — confirm against the live repo before Claude Code starts
- Out of scope — what are we explicitly NOT doing this pass?
- Verification — what do you check at the end to know it worked?
-->

## One-line goal

Add a new top-level **AI** section (nav + home screen), sibling to **Football**, showcasing AI-engineering products you've shipped — starting with a proper deep-dive view of the match-summary feature. Nothing under Football is touched.

## Phase 0 — Discovery (required, do this before writing any code)

Don't guess at the current codebase — inspect it and report back before building. Specifically:

1. **Repo boundary check.** The match-summary JSON currently lives at `~/Documents/portfolio/football-analytics/ai/match_summary/output/{match_id}/match_summary.json` — that path pattern suggests the `football-analytics` repo, not `tmartins14/tylermartins.com`. Confirm: is this file already synced/copied into the site repo today (and if so, how — build step, git submodule, manual copy), or does the Team-level dashboard read it from somewhere else entirely? This determines whether the new page can reuse an existing loader as-is or needs one built.
2. **Trace the existing render path.** Find whatever component in the Team-level Match Analysis Dashboard currently reads `match_summary.json` and renders it. Identify the exact file, the loading mechanism (fetch, fs read at build time, API route, etc.), and confirm the new `/ai/match-summary` page can call the same loader rather than re-implementing it.
3. **Nav and home-screen patterns.** Find the current nav component (where `Home`/`Football` are defined) and the home-screen section list. Confirm how a sibling entry is added — don't introduce a new pattern if one already exists.
4. **Route/layout conventions.** Check how existing pages are structured under the app router (metadata exports, layout wrapping, page-level data fetching pattern) so `/ai` and `/ai/match-summary` match existing conventions rather than inventing new ones.
5. **Design-system rules.** Re-read `design-system.md` for Tool-archetype spacing/motion/type conventions currently in use elsewhere on the site (even though the scale isn't formally locked, there's existing precedent to match).

Report findings on 1–5 back before writing the new routes. If (1) turns up that the JSON isn't currently accessible from the site repo at all, stop and flag it — that's a bigger decision (sync process, submodule, API call to fetch it) than this spec covers.

## Nav + information architecture (site structure)

- Top-level nav: `Home / Football / AI` — three siblings, `AI` is not nested under `Football`
- Home screen gets an `AI` entry alongside the `Football` entry
- `/ai` — section landing page: portfolio index of AI-engineering work you've built (one entry today: match summary)
- `/ai/match-summary` — the showcase/deep-dive view (net-new route)

## Positioning

This is a **product showcase**, not a learning log. The frame is "here's what I built," not "here's what I learned." Same "research engineer as translator" spine as the rest of the site, but the artifact being translated is the feature itself — what it does, what it took to get it working, what it still can't do.

## `/ai` — section landing page

- One entry for now: match summary, linking to `/ai/match-summary`. Built so a second shipped feature is a copy-paste addition later, not a redesign — but there's no placeholder or "coming soon" content for anything unbuilt.
- Same Tool archetype as the dashboards (dense, functional layout/motion) — this isn't editorial content, so no departure from the existing design-system rules.

## `/ai/match-summary` — showcase view

Product leads. Structure:

1. **The output** — the live, real generated summary, pulled from actual StatsBomb match data (reference match: Euro 2024 Final, id `3943043`, unless you want a different example). This is the top of the page, not a scroll away.
2. **What it does** — one or two lines on the feature itself: what input it takes, what it produces, where it lives on the site
3. **How it was built** — short, secondary block. Enough to show engineering judgment (the crawl→walk→run staging, the "model judgment leaking into structured fields" framing from your own notes) without turning the page into a write-up. Factually: a Python script (`generate_match_summary.py`) takes the full StatsBomb event data for a match and calls a Claude model, writing the result to a pre-generated JSON file per match ID. The site does not call the model at request time — it reads the static output.
4. **Known limitations** — same disclosure as wherever it's currently shown, expanded slightly with *why* each limitation exists
5. **What's next** — one line, optional

## Existing dashboards — not touched

- The AI-generated match summary lives in the **Team-level Match Analysis Dashboard**, not the Player Match Analysis Dashboard (Player dashboard has no AI involvement)
- Neither dashboard is modified by this work. No linking, no styling changes, nothing — the new `/ai/match-summary` page reuses whatever component/service already generates the summary (single source of truth, not a copy-pasted static output) but the dashboard itself stays exactly as it is today

## Files/interfaces (fill in exact names from Phase 0 discovery — don't guess ahead of it)

- **Data source:** `match_summary.json`, one file per match ID, at `.../ai/match_summary/output/{match_id}/match_summary.json` (path relative to wherever Phase 0 confirms it actually lives relative to the site repo)
- **Generation (out of scope to touch):** `generate_match_summary.py` — reads full StatsBomb event data, calls a Claude model, writes the JSON. Not re-run or modified as part of this build; the site only ever reads its output.
- **Reuse target:** whatever component/loader Phase 0 identifies as currently rendering this JSON in the Team-level dashboard — the new page imports/calls that, it does not re-implement JSON parsing or add a second loading path
- Nav component / home-screen section list — add `AI` entry as a sibling of `Football` (exact file from Phase 0)
- New route: `app/ai/page.tsx` (or equivalent — confirm against Phase 0's route-convention findings)
- New route: `app/ai/match-summary/page.tsx` (same)
- No changes to any file under the existing Football dashboard routes

## Out of scope

- Any change to either dashboard
- A second AI-eng entry (landing page holds the slot; content isn't written yet)
- OG/social metadata for the new routes (known site-wide gap, unrelated to this feature)
- Locking the site-wide type/spacing/motion scale — separate, smaller piece of work if you want to do it, not folded in here

## Verification (end-to-end check before calling this done)

1. Home screen and nav both show `AI` as a sibling of `Football` — not nested under it
2. `/ai` renders with the match-summary entry linking to `/ai/match-summary`
3. `/ai/match-summary` shows the real generated output for the reference match at the top of the page — not a hardcoded string, not buried under the build write-up
4. Team-level Match Analysis Dashboard diffed against its current state — zero changes
5. Player Match Analysis Dashboard diffed against its current state — zero changes
6. StatsBomb attribution present wherever match data/output appears on the new routes
7. Screenshot both new routes at mobile + desktop widths, check against existing Tool-archetype spacing/motion rules in `design-system.md`