"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createMatchStats } from "footballd3/matchStats";
import { CHART_THEME } from "@/lib/chart-theme";

export type MatchStatsData = {
  home: { team: string; color: string; score: number };
  away: { team: string; color: string; score: number };
  rows: {
    label: string;
    home_value: number;
    away_value: number;
    scale_type: "sum" | "fixed100" | "max";
    format: "int" | "pct" | "float1";
    tier: "basic" | "advanced";
    max_value?: number;
  }[];
  metadata: { match_id: number; competition: string; match_label: string };
};

export function MatchStatsPanel({ data }: { data: MatchStatsData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    // The JSON's colors happen to equal the light-theme hex only — override with
    // the current theme's tokens so bars stay legible (and correct) in dark mode.
    const themedData = {
      ...data,
      home: { ...data.home, color: theme.focal },
      away: { ...data.away, color: theme.secondary },
    };

    createMatchStats(container$, themedData, {
      showHeader: false,
      showTierToggle: false,
      tier: "all",
      width: 680,
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, resolvedTheme]);

  return <div ref={containerRef} className="flex justify-center" />;
}
