"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPitch } from "footballd3/pitch";
import { createHeatmap } from "footballd3/heatmap";
import { createConvexHull } from "footballd3/convexHull";
import { createEventScatter } from "footballd3/eventScatter";
import { classifyLayer } from "footballd3/actionFeed";
import { CHART_THEME, HEAT_SCALE } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { computePxPerYard } from "@/lib/pitch-scale";
import { cn } from "@/lib/utils";
import type { PlayerEvent } from "@/lib/playerEvents";

export type HeatmapBuckets = {
  buckets: { upto_minute: number; event_count: number; grid: { cols: number; rows: number; values: number[][] } }[];
  metadata: {
    match_id: number;
    player_id: number;
    display_name: string;
    team: string;
    bucket_size_minutes: number;
    bandwidth_yards: number;
  };
};

const LAYER_CHIPS: { key: string; label: string }[] = [
  { key: "progressive_pass", label: "Progressive pass" },
  { key: "key_pass", label: "Key pass" },
  { key: "pressure", label: "Pressure" },
  { key: "duel", label: "Duel" },
  { key: "turnover", label: "Turnover" },
  { key: "shot", label: "Shot" },
];

/** Nearest heatmap bucket <= scrubbedMinute, or null before the player's first bucket. */
function nearestBucket(buckets: HeatmapBuckets["buckets"], scrubbedMinute: number) {
  let nearest: HeatmapBuckets["buckets"][number] | null = null;
  for (const bucket of buckets) {
    if (bucket.upto_minute > scrubbedMinute) break;
    nearest = bucket;
  }
  return nearest;
}

type TerritoryPanelProps = {
  /** Scrub-filtered player events (minute <= scrubbedMinute) — NOT layer-filtered; markers are filtered here, the density/hull cloud is not (it represents overall involvement). */
  events: PlayerEvent[];
  heatmapBuckets: HeatmapBuckets;
  scrubbedMinute: number;
  /** Selected player's team — drives the heatmap/hull/marker color (Spain red / England blue). */
  playerTeam: "Spain" | "England";
  activeLayers: Set<string>;
  onToggleLayer: (layer: string) => void;
  heatOpacity?: number;
};

export function TerritoryPanel({
  events,
  heatmapBuckets,
  scrubbedMinute,
  playerTeam,
  activeLayers,
  onToggleLayer,
  heatOpacity = 0.5,
}: TerritoryPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !width) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const teamColor = theme[playerTeam === "Spain" ? "spain" : "england"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    const padding = 20;
    const pxPerYard = computePxPerYard(width, 80, padding, 4.4);
    const pitch = createPitch(svg, {
      mode: "full",
      orientation: "vertical",
      flipAttack: true,
      pxPerYard,
      padding,
      theme: { background: theme.background, lines: theme.pitch, lineWeight: 1.1 },
      showGoals: true,
    });

    const bucket = nearestBucket(heatmapBuckets.buckets, scrubbedMinute);
    if (bucket) {
      // Warm-anchored, identity-decoupled (Ticket 2f) — the ramp's meaning stays
      // constant regardless of which team/player is selected. Team identity lives
      // in the hull/marker colors below, not the heat itself.
      const heat = HEAT_SCALE[resolvedTheme === "dark" ? "dark" : "light"];
      createHeatmap(pitch, { grid: bucket.grid }, {
        colorLow: heat.low,
        colorHigh: heat.high,
        maxOpacity: heatOpacity,
      });
    }

    if (events.length >= 3) {
      createConvexHull(pitch, { points: events.map((e) => e.location) }, {
        toggle: "both",
        pointsColor: teamColor,
        fillOpacity: 0.14,
        strokeOpacity: 0.45,
      });
    }

    const visibleMarkers = events
      .filter((e) => activeLayers.has(classifyLayer(e)))
      .map((e) => ({
        event_id: e.event_id,
        event_type: e.type,
        x: e.location[0],
        y: e.location[1],
        end_x: e.end_location?.[0] ?? null,
        end_y: e.end_location?.[1] ?? null,
        outcome: e.outcome,
        minute: e.minute,
        // Passed through so eventScatter.js's shape classification agrees
        // exactly with classifyLayer's own categories for these same events.
        is_progressive: e.is_progressive,
        key_pass: e.key_pass,
      }));
    createEventScatter(pitch, { events: visibleMarkers }, { markerRadius: 5, markerColor: teamColor });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, heatmapBuckets, scrubbedMinute, playerTeam, activeLayers, heatOpacity, resolvedTheme, width, containerRef]);

  const counts = new Map<string, number>();
  for (const e of events) {
    const layer = classifyLayer(e);
    counts.set(layer, (counts.get(layer) ?? 0) + 1);
  }

  return (
    // h-full + justify-evenly so this panel's content (chips + pitch)
    // distributes evenly across whatever height the card stretches to
    // (matching its right-column sibling) instead of packing to the top
    // and leaving one large gap below the pitch.
    <div data-testid="territory-panel" className="flex h-full flex-col justify-evenly">
      <div className="flex flex-wrap gap-1.5">
        {LAYER_CHIPS.map(({ key, label }) => {
          const active = activeLayers.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleLayer(key)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-2.5 py-1 font-mono text-mono-sm whitespace-nowrap",
                active ? "border-focal bg-focal-soft text-focal" : "border-border text-muted"
              )}
            >
              {label} <span className="text-faint">{counts.get(key) ?? 0}</span>
            </button>
          );
        })}
      </div>
      <div
        ref={containerRef}
        className="flex justify-center"
        role="img"
        aria-label={`Territory heatmap and event markers for ${playerTeam}'s selected player, up to the scrubbed minute`}
      />
    </div>
  );
}
