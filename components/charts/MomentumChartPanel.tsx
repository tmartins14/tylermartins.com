"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createMomentumChart } from "footballd3/momentumChart";
import { CHART_THEME } from "@/lib/chart-theme";

export type MomentumData = {
  home_team: string;
  away_team: string;
  minutes: { minute: number; home_threat: number; away_threat: number; momentum: number }[];
  secondary_minutes: { minute: number; home_threat: number; away_threat: number; momentum: number }[];
  goals: { minute: number; team: string; player: string; is_own_goal: boolean }[];
  red_cards: { minute: number; team: string; player: string }[];
  params?: unknown;
  metadata?: unknown;
};

/**
 * Vertical-orientation momentum charts bulge toward the "home" side (right) by the
 * chart's own convention. Here the real home team (Spain) sits in the dashboard's
 * LEFT column, so the chart's home/away roles are swapped and momentum negated —
 * this makes Spain's bulge lean left, in Spain's own color, matching where its
 * column physically sits. Goals/red-cards pass through unchanged: their `team`
 * field is compared against the (now-swapped) home_team internally by the chart,
 * so each still resolves to the correct side/color automatically.
 */
function flipForLeftHome(data: MomentumData): MomentumData {
  return {
    ...data,
    home_team: data.away_team,
    away_team: data.home_team,
    minutes: data.minutes.map((m) => ({
      minute: m.minute,
      home_threat: m.away_threat,
      away_threat: m.home_threat,
      momentum: -m.momentum,
    })),
    secondary_minutes: data.secondary_minutes.map((m) => ({
      minute: m.minute,
      home_threat: m.away_threat,
      away_threat: m.home_threat,
      momentum: -m.momentum,
    })),
  };
}

export function MomentumChartPanel({ data }: { data: MomentumData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    createMomentumChart(container$, flipForLeftHome(data), {
      orientation: "vertical",
      width: 480,
      height: 300,
      homeColor: theme.secondary,
      awayColor: theme.focal,
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, resolvedTheme]);

  return <div ref={containerRef} className="flex justify-center" />;
}
