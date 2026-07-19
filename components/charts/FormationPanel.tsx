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

    createFormation(svg, data, {
      pxPerYard: 3.6,
      theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.1 },
      nodeColor: theme[colorToken],
      labelColor: theme.text,
      backgroundColor: theme.elevated,
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, colorToken, resolvedTheme]);

  return <div ref={containerRef} className="flex justify-center" />;
}
