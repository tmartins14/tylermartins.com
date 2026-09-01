"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createMatchSummary } from "footballd3/matchSummary";
import { CHART_THEME } from "@/lib/chart-theme";

export type MatchSummaryData = {
  outcome: {
    headline: string;
    key_stats: { label: string; value: string; source_field: string }[];
    standout_performers: { player: string; team: string; reason: string; source_field: string }[];
  };
  tactics: { prose: string };
  metadata: {
    match_id: number;
    home_team: string;
    away_team: string;
    competition: string;
    match_label: string;
    model: string;
  };
};

type MatchSummaryPanelProps = {
  data: MatchSummaryData;
};

// Thin wrapper around footballd3's createMatchSummary — same ref+useEffect
// pattern every other footballd3 chart uses here (see ShotMapPanel.tsx). The
// "view" itself (disclaimer copy, layout, styling) lives in football-analytics'
// footballd3 library, not duplicated here — this component only owns the
// React lifecycle around it, plus resolving CHART_THEME into the vendored
// component's hex-config theme option (it has no live CSS vars of its own).
export function MatchSummaryPanel({ data }: MatchSummaryPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    createMatchSummary(container$, data, {
      theme: {
        border: theme.border,
        text: theme.text,
        muted: theme.muted,
        faint: theme.faint,
        focal: theme.focal,
      },
    });

    return () => {
      container$.selectAll("*").remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, resolvedTheme]);

  return <div ref={containerRef} data-testid="match-summary-panel" />;
}
