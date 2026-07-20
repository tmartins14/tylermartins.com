"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPitch } from "footballd3/pitch";
import { createTeamShape } from "footballd3/teamShape";
import { CHART_THEME } from "@/lib/chart-theme";
import { ToggleGroup } from "@/components/charts/ToggleGroup";

export type TeamShapeData = {
  on_ball: {
    periods: {
      from_minute: number;
      to_minute: number;
      players_in: string[];
      players_out: string[];
      nodes: {
        player_id: number;
        player: string;
        display_name: string;
        x: number;
        y: number;
        event_count: number;
      }[];
      hull?: number[][];
    }[];
  };
  off_ball: {
    density_grid: { cols: number; rows: number; values: number[][] };
    centroid: { x: number; y: number };
    thirds_spine: { third: string; x: number; y: number }[];
    ellipse: { cx: number; cy: number; rx: number; ry: number; angle_deg: number };
    depth_line: { x: number; percentile: number };
  };
  metadata: Record<string, unknown>;
};

type TeamShapeController = {
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  px: (sbX: number, sbY: number) => [number, number];
  update: (view: "on-ball" | "off-ball") => void;
  updatePeriod: (idx: number) => void;
};

/**
 * Draw (or clear) a small centroid cross for the active on-ball period. teamShape.js
 * doesn't compute an on-ball centroid itself (only off-ball has one) — this derives
 * it client-side from the raw node data already available as a prop, matching the
 * design's decorative "+" marker without needing a source patch for it.
 */
function drawCentroidCross(
  teamShape: TeamShapeController,
  data: TeamShapeData,
  view: "on-ball" | "off-ball",
  periodIdx: number,
  color: string
) {
  teamShape.g.selectAll(".ts-centroid-cross").remove();
  if (view !== "on-ball") return;

  const nodes = data.on_ball.periods[periodIdx]?.nodes;
  if (!nodes || nodes.length === 0) return;

  const cx = nodes.reduce((a, n) => a + n.x, 0) / nodes.length;
  const cy = nodes.reduce((a, n) => a + n.y, 0) / nodes.length;
  const [px, py] = teamShape.px(cx, cy);

  teamShape.g.append("line")
    .attr("class", "ts-centroid-cross")
    .attr("x1", px - 6).attr("y1", py).attr("x2", px + 6).attr("y2", py)
    .attr("stroke", color).attr("stroke-width", 1.4);
  teamShape.g.append("line")
    .attr("class", "ts-centroid-cross")
    .attr("x1", px).attr("y1", py - 6).attr("x2", px).attr("y2", py + 6)
    .attr("stroke", color).attr("stroke-width", 1.4);
}

export function TeamShapePanel({
  data,
  colorToken,
  hideControls = false,
}: {
  data: TeamShapeData;
  colorToken: "focal" | "secondary";
  /** Hide the on/off-ball toggle + period select, showing a fixed on-ball/period-0
   * view only — matches the "1A Broadcast" design's simplified single-view Team Shape. */
  hideControls?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<TeamShapeController | null>(null);
  const { resolvedTheme } = useTheme();
  const [view, setView] = useState<"on-ball" | "off-ball">("on-ball");
  const [periodIdx, setPeriodIdx] = useState(0);

  // Mount once per data/color/theme change — view/period changes below drive the
  // already-mounted instance in place instead of remounting the whole pitch.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    // pxPerYard/padding match ShotMapPanel's exactly so this full pitch's width
    // equals the shot map's width (304px) — see FormationPanel for the same math.
    const pitch = createPitch(svg, {
      mode: "full",
      orientation: "vertical",
      flipAttack: true,
      pxPerYard: 3.2,
      padding: 24,
      theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.1 },
    });

    const color = theme[colorToken];
    const teamShape = createTeamShape(pitch, data, {
      view,
      nodeColor: color,
      accentColor: color,
      backgroundColor: theme.elevated,
    });
    controllerRef.current = teamShape;
    if (periodIdx !== 0) teamShape.updatePeriod(periodIdx);
    drawCentroidCross(teamShape, data, view, periodIdx, color);

    return () => {
      controllerRef.current = null;
      container$.selectAll("*").remove();
    };
    // Mount effect intentionally excludes view/periodIdx — those drive the mounted
    // instance imperatively via the effects below, not a remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, colorToken, resolvedTheme]);

  useEffect(() => {
    const teamShape = controllerRef.current;
    if (!teamShape) return;
    teamShape.update(view);
    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    drawCentroidCross(teamShape, data, view, periodIdx, theme[colorToken]);
    // periodIdx/data/colorToken/resolvedTheme read for the cross redraw, not to
    // re-trigger this effect — updatePeriod's own effect below handles that case.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useEffect(() => {
    const teamShape = controllerRef.current;
    if (!teamShape) return;
    teamShape.updatePeriod(periodIdx);
    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    drawCentroidCross(teamShape, data, view, periodIdx, theme[colorToken]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodIdx]);

  const periods = data.on_ball.periods;

  return (
    <div>
      {!hideControls ? (
        <div className="mb-2.5 flex items-center gap-2">
          <ToggleGroup
            options={[
              { value: "on-ball", label: "On-ball" },
              { value: "off-ball", label: "Off-ball" },
            ]}
            value={view}
            onChange={setView}
          />
          {view === "on-ball" ? (
            <select
              value={periodIdx}
              onChange={(e) => setPeriodIdx(Number(e.target.value))}
              className="rounded-[3px] border border-border bg-background px-2 py-[3px] font-mono text-[11px] text-muted"
            >
              {periods.map((p, i) => (
                <option key={i} value={i}>
                  {p.from_minute}&prime;&ndash;{p.to_minute}&prime;
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}
