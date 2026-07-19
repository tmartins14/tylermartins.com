"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPitch } from "footballd3/pitch";
import { createPassNetwork } from "footballd3/passNetwork";
import { CHART_THEME } from "@/lib/chart-theme";

export type PassNetworkData = {
  windows: {
    index: number;
    label: string;
    nodes: { player: string; display_name: string; x: number; y: number; passes: number }[];
    edges: { from: string; to: string; count: number }[];
  }[];
  substitutions?: unknown;
  metadata?: unknown;
};

type PassNetworkPanelProps = {
  data: PassNetworkData;
  colorToken: "focal" | "secondary";
};

export function PassNetworkPanel({ data, colorToken }: PassNetworkPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

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
    createPassNetwork(pitch, data, {
      nodeColor: color,
      edgeColor: color,
      labelColor: theme.elevated,
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, colorToken, resolvedTheme]);

  return <div ref={containerRef} className="flex justify-center" />;
}
