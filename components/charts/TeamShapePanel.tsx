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
  update: (view: "on-ball" | "off-ball") => void;
  updatePeriod: (idx: number) => void;
};

export function TeamShapePanel({
  data,
  colorToken,
}: {
  data: TeamShapeData;
  colorToken: "focal" | "secondary";
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

    const pitch = createPitch(svg, {
      mode: "full",
      orientation: "vertical",
      flipAttack: true,
      pxPerYard: 3.6,
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

    return () => {
      controllerRef.current = null;
      container$.selectAll("*").remove();
    };
    // Mount effect intentionally excludes view/periodIdx — those drive the mounted
    // instance imperatively via the effects below, not a remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, colorToken, resolvedTheme]);

  useEffect(() => {
    controllerRef.current?.update(view);
  }, [view]);

  useEffect(() => {
    controllerRef.current?.updatePeriod(periodIdx);
  }, [periodIdx]);

  const periods = data.on_ball.periods;

  return (
    <div>
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
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}
