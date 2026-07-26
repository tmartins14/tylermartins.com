"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createFormation } from "footballd3/formation";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { computePxPerYard } from "@/lib/pitch-scale";

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
  }, [data, colorToken, resolvedTheme, width, containerRef]);

  return <div ref={containerRef} data-testid="formation-panel" className="flex justify-center" />;
}
