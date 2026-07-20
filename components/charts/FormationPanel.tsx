"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createFormation } from "footballd3/formation";
import { CHART_THEME } from "@/lib/chart-theme";

export type FormationData = {
  periods: {
    formation: string;
    from_minute: number;
    to_minute: number;
    players: {
      player: string;
      display_name: string;
      jersey_number: number;
      position: string;
      template_x: number;
      template_y: number;
    }[];
  }[];
  metadata: {
    match_id: number;
    team: string;
    competition: string;
    match_label: string;
    coordinate_note: string;
  };
};

export function FormationPanel({
  data,
  colorToken,
}: {
  data: FormationData;
  colorToken: "focal" | "secondary";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    // pxPerYard matches ShotMapPanel's exactly (3.2) so this full pitch's width
    // (80yd axis) equals the shot map's half-pitch width (same 80yd axis) — both
    // render at 304px wide. The tradeoff: at true scale a 120yd-tall full pitch
    // needs ~432px of height, so upperHeight grows to match (see dashboard page.tsx).
    const pxPerYard = 3.2;
    const padding = 24;
    const renderedWidth = 80 * pxPerYard + padding * 2;

    createFormation(svg, data, {
      pxPerYard,
      padding,
      theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.1 },
      nodeColor: theme[colorToken],
      labelColor: theme.text,
      backgroundColor: theme.elevated,
      nodeRadius: Math.max(8, renderedWidth * 0.032),
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, colorToken, resolvedTheme]);

  return <div ref={containerRef} className="flex justify-center" />;
}
