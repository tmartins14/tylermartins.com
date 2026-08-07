"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import { FormationPanel, type FormationData, type BenchPlayer } from "@/components/charts/FormationPanel";
import { MasterScrubberPanel } from "@/components/charts/MasterScrubberPanel";
import { HighlightReelPanel } from "@/components/charts/HighlightReelPanel";
import { PlayerStatCardsPanel, type PossessionShares } from "@/components/charts/PlayerStatCardsPanel";
import { TerritoryPanel, type HeatmapBuckets } from "@/components/charts/TerritoryPanel";
import { CumulativeXtPanel } from "@/components/charts/CumulativeXtPanel";
import { GoalMouthShotPanel } from "@/components/charts/GoalMouthShotPanel";
import { PassSonarPanel } from "@/components/charts/PassSonarPanel";
import { ActionFeedPanel } from "@/components/charts/ActionFeedPanel";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { scrubFilter, type PlayerEvent, type PlayerEventsFile } from "@/lib/playerEvents";
import { cn } from "@/lib/utils";

const ALL_LAYERS = new Set(["progressive_pass", "key_pass", "pressure", "duel", "turnover", "shot"]);
const FINAL_MINUTE = 94;
// Stable reference (not a fresh `[]` literal on every render) so scrubEvents'
// useMemo below doesn't invalidate every render while no player is selected.
const EMPTY_EVENTS: PlayerEvent[] = [];

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

type PlayerMatchAnalysisClientProps = {
  formationByTeam: Record<Team, FormationData>;
  benchByTeam: Record<Team, BenchPlayer[]>;
  possessionShares: PossessionShares;
  teamColorToken: Record<Team, "focal" | "secondary">;
  competition: string;
  matchId: number;
};

export function PlayerMatchAnalysisClient({
  formationByTeam,
  benchByTeam,
  possessionShares,
  teamColorToken,
  competition,
  matchId,
}: PlayerMatchAnalysisClientProps) {
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

  const popupRef = useRef<HTMLDivElement | null>(null);

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

  // Mobile full-overlay: scroll the popup into view (and to its own top) on
  // selection, matching the design's "scrolled to top" requirement — desktop's
  // two-column layout needs no scroll, this is a no-op there since the popup
  // is already on-screen beside the lineup panel.
  useEffect(() => {
    if (selectedPlayerId != null) {
      popupRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
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
  const rosterEntry = selectedPlayerId != null ? roster.get(selectedPlayerId) : null;

  return (
    <div
      className={cn(
        "grid gap-[18px]",
        "min-[900px]:grid-cols-[316px_minmax(0,1fr)] min-[900px]:items-start"
      )}
    >
      <div className="min-[900px]:sticky min-[900px]:top-[calc(var(--topbar-h)+16px)] rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="font-mono text-[11px] tracking-[0.1em] text-faint uppercase">Lineups</div>
          <ToggleGroup
            options={[
              { value: "Spain", label: "Spain" },
              { value: "England", label: "England" },
            ]}
            value={viewTeam}
            onChange={setViewTeam}
          />
        </div>
        <FormationPanel
          data={formationByTeam[viewTeam]}
          colorToken={teamColorToken[viewTeam]}
          bench={benchByTeam[viewTeam]}
          selectedId={selectedPlayerId}
          onSelect={(playerId) => selectPlayer(playerId)}
        />
      </div>

      <div ref={popupRef} className="relative">
        {selectedPlayerId == null ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-border-strong bg-background p-10 text-center font-mono text-sm text-muted">
            Select a starter or substitute to load their match analysis.
          </div>
        ) : (
          <div
            data-testid="player-popup"
            className={cn(
              "overflow-hidden rounded-2xl border border-border-strong bg-background shadow-[0_40px_90px_-50px_rgba(23,23,23,0.55)]",
              "max-[1023px]:absolute max-[1023px]:inset-x-0 max-[1023px]:top-0 max-[1023px]:z-40 max-[1023px]:min-h-full"
            )}
          >
            {hasLoadError || !rosterEntry ? (
              <div className="p-10 text-center font-mono text-sm text-muted">Couldn&apos;t load this player&apos;s data.</div>
            ) : (
              <>
                <PopupHeader
                  entry={rosterEntry}
                  colorToken={teamColorToken[rosterEntry.team]}
                  onClose={closePopup}
                />
                {!playerEvents || !heatmapBuckets ? (
                  <div className="p-10 text-center font-mono text-sm text-muted">Loading…</div>
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
  colorToken,
  onClose,
}: {
  entry: RosterEntry;
  colorToken: "focal" | "secondary";
  onClose: () => void;
}) {
  const colorClass = colorToken === "focal" ? "text-focal" : "text-secondary";
  const ringClass = colorToken === "focal" ? "ring-focal" : "ring-secondary";
  const badgeClass = colorToken === "focal" ? "bg-focal" : "bg-secondary";

  return (
    <div className="flex items-center gap-5 border-b border-border px-[30px] py-6">
      <div className="relative shrink-0">
        <div className={cn("flex h-[66px] w-[66px] items-center justify-center rounded-full bg-elevated ring-2", ringClass)}>
          <span className="display text-lg font-semibold">{initials(entry.display_name)}</span>
        </div>
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white",
            badgeClass
          )}
        >
          {entry.jersey_number}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className={cn("font-mono text-[11px] tracking-[0.08em] uppercase", colorClass)}>
          {entry.team}
          {entry.isSub ? ` · sub ${entry.on_minute}'` : ""}
        </div>
        <h2 className="display truncate text-[30px] font-black">{entry.display_name}</h2>
        <div className="font-mono text-[12px] text-muted">#{entry.jersey_number} &middot; {entry.position}</div>
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

  return (
    <div className="flex flex-col gap-[18px] p-[24px] min-[900px]:p-[30px]">
      <div className="grid gap-[18px] min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="rounded-xl border border-border bg-surface p-4">
          <HighlightReelPanel
            events={fullEvents}
            onReset={() => setScrubbedMinute(0)}
            onMoment={(m) => setScrubbedMinute(m.minute)}
          />
        </div>
        <div ref={statCardsRef} className="rounded-xl border border-border bg-surface p-4">
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
      </div>

      <div className="rounded-xl border border-border bg-surface p-3">
        <MasterScrubberPanel
          events={fullEvents}
          maxMinute={94}
          scrubbedMinute={scrubbedMinute}
          onScrub={setScrubbedMinute}
        />
      </div>

      <div className="grid gap-[18px] min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="rounded-xl border border-border bg-surface p-4">
          <TerritoryPanel
            events={scrubEvents}
            heatmapBuckets={heatmapBuckets}
            scrubbedMinute={scrubbedMinute}
            activeLayers={activeLayers}
            onToggleLayer={toggleLayer}
          />
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-1 font-mono text-[11px] tracking-[0.08em] text-faint uppercase">Cumulative xT</div>
            {/* CumulativeXtPanel's own root is h-full flex-1 — it needs a flex
                ancestor to resolve against, not just a fixed-height block, or
                useContainerWidth reads height 0 and the panel never renders. */}
            <div className="flex h-[180px] flex-col">
              <CumulativeXtPanel
                events={scrubEvents}
                finalMinute={94}
                hoveredEventId={hoveredEventId}
                onHoverEvent={setHoveredEventId}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-[18px] min-[560px]:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-1 font-mono text-[11px] tracking-[0.08em] text-faint uppercase">Shots &middot; xG</div>
              <GoalMouthShotPanel events={scrubEvents} hoveredEventId={hoveredEventId} onHoverEvent={setHoveredEventId} />
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-1 font-mono text-[11px] tracking-[0.08em] text-faint uppercase">Pass sonar</div>
              <PassSonarPanel
                events={scrubEvents}
                hoveredEventId={hoveredEventId}
                onHoverEvent={(ids) => setHoveredEventId(ids?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-1 font-mono text-[11px] tracking-[0.08em] text-faint uppercase">Action feed</div>
            <ActionFeedPanel
              events={scrubEvents}
              activeLayers={activeLayers}
              hoveredEventId={hoveredEventId}
              onHoverEvent={setHoveredEventId}
            />
          </div>
        </div>
      </div>

      <div className="text-right font-mono text-[11px] text-faint">
        {competition} &middot; match {matchId}
      </div>
    </div>
  );
}
