"use client";

import { useEffect, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createCumulativeXgChart } from "footballd3/cumulativeXgChart";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";

export type CumulativeXgPoint = {
  minute: number;
  team: string;
  display_name: string;
  xg: number;
  cumulative_xg: number;
  outcome: string;
  is_goal: boolean;
};

export type CumulativeXgData = {
  home_team: string;
  away_team: string;
  points: CumulativeXgPoint[];
  final_minute: number;
  final_home_xg: number;
  final_away_xg: number;
  goals: { minute: number; team: string; player: string; is_own_goal: boolean }[];
  metadata?: Record<string, unknown>;
};

type HoverPoint = CumulativeXgPoint & { homeCum: number; awayCum: number };

export function CumulativeXgPanel({ data }: { data: CumulativeXgData }) {
  const { ref: containerRef, width, height } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();
  const [hover, setHover] = useState<HoverPoint | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !width || !height) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    createCumulativeXgChart(container$, data, {
      width,
      height,
      homeColor: theme.secondary,
      awayColor: theme.focal,
      showTooltip: false,
      onHover: setHover,
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, resolvedTheme, width, height, containerRef]);

  const readout = hover
    ? `${hover.minute}' · ${data.home_team} ${hover.homeCum.toFixed(2)} — ${data.away_team} ${hover.awayCum.toFixed(2)}`
    : `Full time · ${data.home_team} ${data.final_home_xg.toFixed(2)} — ${data.away_team} ${data.final_away_xg.toFixed(2)} xG`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={containerRef} className="min-h-0 flex-1" />
      <div className="mt-1.5 font-mono text-[11px] text-muted">{readout}</div>
    </div>
  );
}
