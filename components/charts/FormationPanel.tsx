"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createFormation } from "footballd3/formation";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { computePxPerYard } from "@/lib/pitch-scale";

export type FormationPlayer = {
  player_id: number;
  player: string;
  display_name: string;
  jersey_number: number;
  position: string;
  template_x: number;
  template_y: number;
};

export type FormationData = {
  periods: {
    formation: string;
    from_minute: number;
    to_minute: number;
    players: FormationPlayer[];
  }[];
  metadata: {
    match_id: number;
    team: string;
    competition: string;
    match_label: string;
    coordinate_note: string;
  };
};

export type BenchPlayer = {
  player_id: number;
  player: string;
  display_name: string;
  jersey_number: number;
  position: string;
  on_minute: number;
  on_second: number;
  replaced_player: string;
};

type FormationPanelProps = {
  data: FormationData;
  colorToken: "focal" | "secondary";
  /** Substitutes for this same team (substitutes_{match_id}.json's per-team array). Omit for a bench-less, read-only diagram. */
  bench?: BenchPlayer[];
  /** player_id of the currently selected player, or null. Rings the matching starter/bench row. */
  selectedId?: number | null;
  /** Fires with (playerId, team) on any non-goalkeeper starter or bench click — omit for a read-only diagram. */
  onSelect?: (playerId: number, team: string) => void;
};

export function FormationPanel({ data, colorToken, bench, selectedId = null, onSelect }: FormationPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || width == null) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    // pxPerYard is derived from the measured column width, capped at 3.2 — the
    // desktop-tuned value that matches ShotMapPanel's width (both share the 80yd
    // axis). At/above the cap this renders identically to the old fixed value;
    // below it, the pitch shrinks to fit narrower viewports instead of overflowing.
    const padding = 24;
    const pxPerYard = computePxPerYard(width, 80, padding, 3.2);
    const renderedWidth = 80 * pxPerYard + padding * 2;

    createFormation(
      svg,
      { ...data, bench },
      {
        pxPerYard,
        padding,
        theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.1 },
        nodeColor: theme[colorToken],
        labelColor: theme.text,
        backgroundColor: theme.elevated,
        nodeRadius: Math.max(8, renderedWidth * 0.032),
        selectedColor: colorToken === "focal" ? theme.secondary : theme.focal,
        selectedId,
        onPlayerClick: onSelect ? (player: FormationPlayer | BenchPlayer) => onSelect(player.player_id, data.metadata.team) : null,
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, bench, colorToken, selectedId, onSelect, resolvedTheme, width, containerRef]);

  return <div ref={containerRef} data-testid="formation-panel" className="flex justify-center" />;
}
