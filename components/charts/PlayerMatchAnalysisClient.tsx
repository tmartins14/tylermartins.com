"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { CHART_THEME } from "@/lib/chart-theme";
import { FormationPanel, type FormationData, type BenchPlayer } from "@/components/charts/FormationPanel";
import { TimelinePanel, type TimelineMode } from "@/components/charts/TimelinePanel";
import { PlayerStatCardsPanel, type PossessionShares } from "@/components/charts/PlayerStatCardsPanel";
import { TerritoryPanel, type HeatmapBuckets } from "@/components/charts/TerritoryPanel";
import { CumulativeXtPanel } from "@/components/charts/CumulativeXtPanel";
import { GoalMouthShotPanel } from "@/components/charts/GoalMouthShotPanel";
import { PassSonarPanel } from "@/components/charts/PassSonarPanel";
import { ActionFeedPanel } from "@/components/charts/ActionFeedPanel";
import { AsyncSkeleton, AsyncError, AsyncEmpty } from "@/components/charts/AsyncState";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { scrubFilter, type PlayerEvent, type PlayerEventsFile } from "@/lib/playerEvents";
import { cn } from "@/lib/utils";

const ALL_LAYERS = new Set(["progressive_pass", "key_pass", "pressure", "duel", "turnover", "shot"]);
const FINAL_MINUTE = 94;
// Stable reference (not a fresh `[]` literal on every render) so scrubEvents'
// useMemo below doesn't invalidate every render while no player is selected.
const EMPTY_EVENTS: PlayerEvent[] = [];
// Ticket 4b — below this, a player's full-match event count is real data, not
// a load failure, but too sparse for the charts below to say anything (a late
// substitute with 1-2 touches, e.g. Ivan Toney's single event this match).
// Distinct from a fetch error: this is an expected, correct outcome.
const NEAR_ZERO_EVENTS_THRESHOLD = 3;

type Team = "Spain" | "England";

type RosterEntry = {
  player_id: number;
  display_name: string;
  jersey_number: number;
  position: string;
  team: Team;
  isSub: boolean;
  on_minute?: number;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/** #RRGGBB -> "rgba(r,g,b,alpha)" — used for the team toggle's soft active background. */
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type PlayerMatchAnalysisClientProps = {
  formationByTeam: Record<Team, FormationData>;
  benchByTeam: Record<Team, BenchPlayer[]>;
  possessionShares: PossessionShares;
  competition: string;
  matchId: number;
  venue: string;
  matchDate: string;
  homeScore: number;
  awayScore: number;
};

export function PlayerMatchAnalysisClient({
  formationByTeam,
  benchByTeam,
  possessionShares,
  competition,
  matchId,
  venue,
  matchDate,
  homeScore,
  awayScore,
}: PlayerMatchAnalysisClientProps) {
  const { resolvedTheme } = useTheme();
  // Gated behind `mounted` so the first client render matches the server's
  // "light" default exactly, avoiding a hydration mismatch — next-themes'
  // resolvedTheme is undefined during SSR and the first client render
  // (before the stored/system preference resolves), so reading it directly
  // here would render "light" server-side but "dark" client-side for a
  // dark-preference visitor the instant hydration completes. Every other
  // panel on this page reads resolvedTheme inside a useEffect instead
  // (client-only, never runs during SSR) — this file reads it directly in
  // JSX, same as TeamColumnCard.tsx (which got this same fix separately
  // after shipping without it — same class of bug, same guard).
  const [mounted, setMounted] = useState(false);
  // Standard next-themes hydration guard (same pattern as ThemeToggle.tsx):
  // resolvedTheme is unknown on the server, so theme-dependent values must
  // stay at their light-theme default until after the client mounts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const theme = CHART_THEME[mounted && resolvedTheme === "dark" ? "dark" : "light"];
  const [viewTeam, setViewTeam] = useState<Team>("Spain");
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [scrubbedMinute, setScrubbedMinute] = useState(FINAL_MINUTE);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(ALL_LAYERS));

  // Fetched data is stored raw and matched against selectedPlayerId at read
  // time (below) rather than reset with an extra setState call at the top of
  // the fetch effect — that reset would fire synchronously inside the effect
  // body, which triggers an avoidable extra render on every selection change.
  const [fetchedEvents, setFetchedEvents] = useState<PlayerEventsFile | null>(null);
  const [fetchedBuckets, setFetchedBuckets] = useState<HeatmapBuckets | null>(null);
  const [loadErrorForId, setLoadErrorForId] = useState<number | null>(null);

  const roster = useMemo<Map<number, RosterEntry>>(() => {
    const map = new Map<number, RosterEntry>();
    (Object.keys(formationByTeam) as Team[]).forEach((team) => {
      formationByTeam[team].periods[0]?.players.forEach((p) => {
        map.set(p.player_id, {
          player_id: p.player_id, display_name: p.display_name,
          jersey_number: p.jersey_number, position: p.position, team, isSub: false,
        });
      });
      benchByTeam[team].forEach((p) => {
        map.set(p.player_id, {
          player_id: p.player_id, display_name: p.display_name,
          jersey_number: p.jersey_number, position: p.position, team, isSub: true, on_minute: p.on_minute,
        });
      });
    });
    return map;
  }, [formationByTeam, benchByTeam]);

  function selectPlayer(playerId: number) {
    setSelectedPlayerId(playerId);
    setScrubbedMinute(FINAL_MINUTE);
    setHoveredEventId(null);
    setActiveLayers(new Set(ALL_LAYERS));
  }

  function closePopup() {
    setSelectedPlayerId(null);
  }

  function toggleLayer(layer: string) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }

  useEffect(() => {
    if (selectedPlayerId == null) return;
    let cancelled = false;

    Promise.all([
      fetch(`/api/player-match-analysis/player-events/${selectedPlayerId}`).then((r) => {
        if (!r.ok) throw new Error("player-events fetch failed");
        return r.json();
      }),
      fetch(`/api/player-match-analysis/heatmap-buckets/${selectedPlayerId}`).then((r) => {
        if (!r.ok) throw new Error("heatmap-buckets fetch failed");
        return r.json();
      }),
    ])
      .then(([events, buckets]) => {
        if (cancelled) return;
        setFetchedEvents(events);
        setFetchedBuckets(buckets);
      })
      .catch(() => {
        if (!cancelled) setLoadErrorForId(selectedPlayerId);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPlayerId]);

  // Matched against selectedPlayerId rather than reset on selection change —
  // this is what makes the previous player's data disappear (fall back to
  // the loading state) the instant a new player is picked, without an extra
  // setState call in the fetch effect above.
  const playerEvents = fetchedEvents?.metadata.player_id === selectedPlayerId ? fetchedEvents : null;
  const heatmapBuckets = fetchedBuckets?.metadata.player_id === selectedPlayerId ? fetchedBuckets : null;
  const hasLoadError = loadErrorForId === selectedPlayerId;

  const fullEvents = playerEvents?.events ?? EMPTY_EVENTS;
  const scrubEvents = useMemo(() => scrubFilter(fullEvents, scrubbedMinute), [fullEvents, scrubbedMinute]);
  // Only meaningful once data has actually loaded — playerEvents is null
  // while loading, so this can't misfire as "empty" before the fetch settles.
  const hasNearZeroEvents = playerEvents != null && fullEvents.length < NEAR_ZERO_EVENTS_THRESHOLD;
  const rosterEntry = selectedPlayerId != null ? roster.get(selectedPlayerId) : null;

  return (
    <div
      className={cn(
        "grid gap-3.5",
        // Matches the popup's own max-pma:fixed breakpoint exactly — both
        // read from --breakpoint-pma, so the two-column split and the mobile
        // full-overlay rule can never both be active in the same gap.
        "pma:grid-cols-[316px_minmax(0,1fr)] pma:items-start"
      )}
    >
      <div className="pma:sticky pma:top-[calc(var(--topbar-h)+16px)] rounded-xl border border-border bg-surface p-5">
        <div className="font-mono text-mono-sm tracking-[0.14em] text-focal uppercase">Player Match Analysis</div>
        <div className="display mt-1.25 mb-0.5 text-display-3 font-black">
          Spain <span style={{ color: theme.spain }}>{homeScore}</span>–
          <span style={{ color: theme.england }}>{awayScore}</span> England
        </div>
        <div className="mb-3.5 font-mono text-mono-sm text-faint">
          {competition} &middot; {venue} &middot; {matchDate}
        </div>

        <div className="mb-2.5 flex items-center justify-between gap-2.5">
          <div className="inline-flex">
            {(["Spain", "England"] as Team[]).map((team, i) => {
              const active = viewTeam === team;
              const color = team === "Spain" ? theme.spain : theme.england;
              return (
                <button
                  key={team}
                  type="button"
                  onClick={() => setViewTeam(team)}
                  className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-mono-sm font-medium"
                  style={{
                    border: `1px solid ${active ? color : theme.border}`,
                    marginLeft: i ? -1 : 0,
                    borderTopLeftRadius: i ? 0 : 5,
                    borderBottomLeftRadius: i ? 0 : 5,
                    borderTopRightRadius: i ? 5 : 0,
                    borderBottomRightRadius: i ? 5 : 0,
                    position: "relative",
                    zIndex: active ? 1 : 0,
                    background: active ? hexToRgba(color, 0.12) : "transparent",
                    color: active ? color : theme.muted,
                  }}
                >
                  <span className="inline-block h-[9px] w-[9px] rounded-[2px]" style={{ background: color }} />
                  {team}
                </button>
              );
            })}
          </div>
          <div className="font-mono text-mono-xs tracking-[0.1em] text-faint uppercase">
            {`${formationByTeam[viewTeam].periods[0]?.formation} · Click a player`}
          </div>
        </div>

        <FormationPanel
          data={formationByTeam[viewTeam]}
          colorToken={viewTeam === "Spain" ? "spain" : "england"}
          bench={benchByTeam[viewTeam]}
          selectedId={selectedPlayerId}
          onSelect={(playerId) => selectPlayer(playerId)}
        />
      </div>

      <div>
        {selectedPlayerId == null ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-border-strong bg-background p-10 text-center font-mono text-mono-sm text-muted">
            Select a starter or substitute to load their match analysis.
          </div>
        ) : (
          <div
            data-testid="player-popup"
            className={cn(
              "rounded-2xl border border-border-strong bg-background shadow-[0_40px_90px_-50px_rgba(23,23,23,0.55)]",
              "pma:overflow-hidden",
              // `fixed`, not `absolute` — absolute anchored to this column's
              // wrapper div, and that div's own height collapses to 0 the
              // instant its only child (this one) leaves normal flow, which
              // left the popup's `top: 0` landing wherever that collapsed,
              // zero-height div happened to sit in the page (right after the
              // roster above it), not the true top of the viewport — some of
              // the roster stayed visible above the popup instead of being
              // covered by it. `fixed` anchors to the viewport itself, so it
              // can't be undermined by a parent collapsing. `inset-0` (not
              // `inset-x-0` + `top-0`) covers the full screen edge to edge,
              // so there's no lingering rounded corner/border against the
              // literal screen edge, and its own `overflow-y-auto` lets the
              // popup's (much taller) content scroll itself while the page
              // underneath stays put — no scroll-into-view timing to get
              // wrong, the roster is fully hidden the instant this mounts.
              "max-pma:fixed max-pma:inset-0 max-pma:z-40 max-pma:overflow-y-auto max-pma:rounded-none max-pma:border-0"
            )}
          >
            {hasLoadError || !rosterEntry ? (
              <AsyncError message="Couldn't load this player's data." />
            ) : !playerEvents || !heatmapBuckets ? (
              // Skeleton stands in for the whole popup (header included) — the
              // header itself has nothing real to show yet either, since
              // rosterEntry alone doesn't carry this match's action data.
              <AsyncSkeleton />
            ) : (
              <>
                <PopupHeader
                  entry={rosterEntry}
                  teamColor={theme[rosterEntry.team === "Spain" ? "spain" : "england"]}
                  onClose={closePopup}
                />
                {hasNearZeroEvents ? (
                  <AsyncEmpty
                    message={`${rosterEntry.display_name} recorded ${fullEvents.length} action${fullEvents.length === 1 ? "" : "s"} this match — not enough to chart.`}
                  />
                ) : (
                  <PopupBody
                    fullEvents={fullEvents}
                    scrubEvents={scrubEvents}
                    heatmapBuckets={heatmapBuckets}
                    possessionShares={possessionShares}
                    playerTeam={rosterEntry.team}
                    scrubbedMinute={scrubbedMinute}
                    setScrubbedMinute={setScrubbedMinute}
                    hoveredEventId={hoveredEventId}
                    setHoveredEventId={setHoveredEventId}
                    activeLayers={activeLayers}
                    toggleLayer={toggleLayer}
                    matchId={matchId}
                    competition={competition}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PopupHeader({
  entry,
  teamColor,
  onClose,
}: {
  entry: RosterEntry;
  teamColor: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-5 border-b border-border bg-surface px-7.5 py-6">
      <div className="relative shrink-0">
        <div
          className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-elevated"
          style={{ boxShadow: `0 0 0 2px ${teamColor}` }}
        >
          <span className="display text-lg font-semibold">{initials(entry.display_name)}</span>
        </div>
        <span
          className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full font-mono text-mono-xs font-bold text-white"
          style={{ background: teamColor }}
        >
          {entry.jersey_number}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-mono-sm tracking-[0.08em] uppercase" style={{ color: teamColor }}>
          {entry.team}
          {entry.isSub ? ` · sub ${entry.on_minute}'` : ""}
        </div>
        <h2 className="display truncate text-display-2 font-black">{entry.display_name}</h2>
        <div className="font-mono text-mono-base text-muted">#{entry.jersey_number} &middot; {entry.position}</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close player analysis"
        className="rounded-full border border-border p-2 text-muted hover:text-focal"
      >
        ✕
      </button>
    </div>
  );
}

function PopupBody({
  fullEvents,
  scrubEvents,
  heatmapBuckets,
  possessionShares,
  playerTeam,
  scrubbedMinute,
  setScrubbedMinute,
  hoveredEventId,
  setHoveredEventId,
  activeLayers,
  toggleLayer,
  matchId,
  competition,
}: {
  fullEvents: PlayerEvent[];
  scrubEvents: PlayerEvent[];
  heatmapBuckets: HeatmapBuckets;
  possessionShares: PossessionShares;
  playerTeam: Team;
  scrubbedMinute: number;
  setScrubbedMinute: (m: number) => void;
  hoveredEventId: string | null;
  setHoveredEventId: (id: string | null) => void;
  activeLayers: Set<string>;
  toggleLayer: (layer: string) => void;
  matchId: number;
  competition: string;
}) {
  const { ref: statCardsRef, width: statCardsWidth } = useContainerWidth<HTMLDivElement>();
  const [timelineMode, setTimelineMode] = useState<TimelineMode>("highlights");
  const [timelineSpeed, setTimelineSpeed] = useState<1 | 2 | 4>(1);

  return (
    <div className="flex min-w-0 flex-col gap-3.5 p-4.5 pma-md:p-5.5">
      <div className="min-w-0 rounded-xl border border-border bg-surface p-3">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-mono-sm tracking-[0.08em] text-faint uppercase">Timeline</div>
          {/* Speed + mode toggles grouped into one visually connected
              cluster — a divider between the two groups, not two independent
              floating rows — reads as "the timeline's controls," not two
              unrelated toggles. */}
          <div className="flex items-center gap-2">
            <div className="inline-flex shrink-0">
              {([1, 2, 4] as const).map((s, i) => {
                const active = timelineSpeed === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTimelineSpeed(s)}
                    style={{ position: "relative", zIndex: active ? 1 : 0 }}
                    className={cn(
                      "border px-2 py-1 font-mono text-mono-sm font-medium whitespace-nowrap",
                      i === 0 ? "rounded-l-[5px]" : "-ml-px",
                      i === 2 && "rounded-r-[5px]",
                      active ? "border-focal bg-focal-soft text-focal" : "border-border text-muted"
                    )}
                  >
                    {s}&times;
                  </button>
                );
              })}
            </div>
            <div className="inline-flex shrink-0 border-l border-border pl-2">
              {(["highlights", "all"] as TimelineMode[]).map((m, i) => {
                const active = timelineMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTimelineMode(m)}
                    style={{ position: "relative", zIndex: active ? 1 : 0 }}
                    className={cn(
                      "border px-2.5 py-1 font-mono text-mono-sm font-medium whitespace-nowrap",
                      i === 0 ? "rounded-l-[5px]" : "-ml-px rounded-r-[5px]",
                      active ? "border-focal bg-focal-soft text-focal" : "border-border text-muted"
                    )}
                  >
                    {m === "highlights" ? "Highlights" : "All events"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <TimelinePanel
          events={fullEvents}
          maxMinute={94}
          scrubbedMinute={scrubbedMinute}
          mode={timelineMode}
          speedMultiplier={timelineSpeed}
          onScrub={setScrubbedMinute}
          onHoverEvent={setHoveredEventId}
        />
      </div>

      <div ref={statCardsRef} className="min-w-0 rounded-xl border border-border bg-surface p-3">
        <div className="mb-1 font-mono text-mono-sm tracking-[0.08em] text-faint uppercase">Match contribution</div>
        <PlayerStatCardsPanel
          events={scrubEvents}
          possessionShares={possessionShares}
          playerTeam={playerTeam}
          scrubbedMinute={scrubbedMinute}
          columns={statCardsWidth != null && statCardsWidth < 560 ? 2 : 3}
          onHoverLayer={(layer) => {
            if (!layer) return;
            // Card hover EMPHASIZES a layer (dims others) rather than
            // isolating it like a chip click — approximated here by
            // temporarily narrowing activeLayers is too destructive
            // (would hide other markers instead of dimming them), so this
            // is intentionally a no-op hook for a future dim-not-hide
            // treatment; wiring it through hoveredEventId would conflate
            // "layer" and "event" scope, which the design keeps distinct.
          }}
        />
      </div>

      {/* min-w-0 on every grid-item/flex-item wrapper below: CSS Grid (and
          flex) items default to min-width: auto, which refuses to shrink
          below the intrinsic width of their content. Each chart panel here
          measures its OWN container via useContainerWidth (a ResizeObserver
          on its root div, hooks/useContainerWidth.ts) — without min-w-0 on
          the ancestor, the wrapper "wants" to be as wide as whatever the
          chart naturally renders, the chart renders at that width, and the
          two reinforce each other into a stable state wider than the actual
          track — real bug, reported live: the popup's own scrollWidth
          measured 474px in a 375px box, and the Territory pitch diagram was
          visibly clipped at the right edge. min-w-0 has no effect on an
          element that isn't hitting this, so applying it broadly here is
          safe, not just to the one confirmed offender. */}
      <div className="grid min-w-0 gap-3.5 pma-md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="flex min-w-0 flex-col rounded-xl border border-border bg-surface p-3">
          <div className="mb-1 font-mono text-mono-sm tracking-[0.08em] text-faint uppercase">Territory &amp; events</div>
          {/* Stretched to align with the bottom of the right column's last
              card (Action feed) — TerritoryPanel distributes its own content
              evenly across that height instead of packing to the top. */}
          <div className="flex min-w-0 flex-1 flex-col">
            <TerritoryPanel
              events={scrubEvents}
              heatmapBuckets={heatmapBuckets}
              scrubbedMinute={scrubbedMinute}
              playerTeam={playerTeam}
              activeLayers={activeLayers}
              onToggleLayer={toggleLayer}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="min-w-0 rounded-xl border border-border bg-surface p-3">
            <div className="mb-1 font-mono text-mono-sm tracking-[0.08em] text-faint uppercase">Cumulative xT</div>
            {/* CumulativeXtPanel's own root is h-full flex-1 — it needs a flex
                ancestor to resolve against, not just a fixed-height block, or
                useContainerWidth reads height 0 and the panel never renders. */}
            <div className="flex h-[150px] min-w-0 flex-col">
              <CumulativeXtPanel
                events={scrubEvents}
                finalMinute={94}
                playerTeam={playerTeam}
                hoveredEventId={hoveredEventId}
                onHoverEvent={setHoveredEventId}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 pma-sm:grid-cols-2">
            <div className="min-w-0 rounded-xl border border-border bg-surface p-3">
              <div className="mb-1 font-mono text-mono-sm tracking-[0.08em] text-faint uppercase">Shots &middot; xG</div>
              <GoalMouthShotPanel events={scrubEvents} playerTeam={playerTeam} hoveredEventId={hoveredEventId} onHoverEvent={setHoveredEventId} />
            </div>
            <div className="min-w-0 rounded-xl border border-border bg-surface p-3">
              <div className="mb-1 font-mono text-mono-sm tracking-[0.08em] text-faint uppercase">Pass sonar</div>
              <PassSonarPanel
                events={scrubEvents}
                playerTeam={playerTeam}
                hoveredEventId={hoveredEventId}
                onHoverEvent={(ids) => setHoveredEventId(ids?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-border bg-surface p-3">
            <div className="mb-1 font-mono text-mono-sm tracking-[0.08em] text-faint uppercase">Action feed</div>
            <ActionFeedPanel
              events={scrubEvents}
              playerTeam={playerTeam}
              activeLayers={activeLayers}
              hoveredEventId={hoveredEventId}
              onHoverEvent={setHoveredEventId}
            />
          </div>
        </div>
      </div>

      <div className="text-right font-mono text-mono-sm text-faint">
        {competition} &middot; match {matchId}
      </div>
    </div>
  );
}
