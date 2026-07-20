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

    // pxPerYard/padding match ShotMapPanel's exactly so this full pitch's width
    // equals the shot map's width (304px) — see FormationPanel for the same math.
    const pitch = createPitch(svg, {
      mode: "full",
      orientation: "vertical",
      flipAttack: true,
      pxPerYard: 3.2,
      padding: 24,
      theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.1 },
    });

    const color = theme[colorToken];
    createPassNetwork(pitch, data, {
      nodeColor: color,
      edgeColor: color,
      // Labels sit below each node (not on top of it) — a player's full name is far
      // wider than the node, so it needs to read against the pitch surface, not the
      // node fill. theme.text (not theme.elevated, which matches the pitch background
      // and made labels invisible) gives real contrast there.
      labelColor: theme.text,
      labelPosition: "below",
      // Tightened from the defaults ([5,18] / [0.8,5]) — sized for this component's
      // original full-width demo context, too big/cluttered on this ~304px pitch.
      nodeRadius: [4, 10],
      edgeWidth: [0.5, 2.5],
      minEdgeCount: 4,
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, colorToken, resolvedTheme]);

  return <div ref={containerRef} className="flex justify-center" />;
}
