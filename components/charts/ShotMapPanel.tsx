"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createShotMap } from "footballd3/shotMap";
import { CHART_THEME } from "@/lib/chart-theme";

export type Shot = {
  x: number;
  y: number;
  xg: number;
  outcome: string;
  is_goal: boolean;
  team: string;
  display_name: string;
  minute: number;
};

type ShotMapPanelProps = {
  shots: Shot[];
  colorToken: "focal" | "secondary";
};

export function ShotMapPanel({ shots, colorToken }: ShotMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    createShotMap(svg, shots, {
      orientation: "vertical",
      pxPerYard: 3.2,
      theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.2 },
      color: theme[colorToken],
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [shots, colorToken, resolvedTheme]);

  return <div ref={containerRef} className="flex justify-center" />;
}
