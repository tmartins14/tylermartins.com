"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPitch } from "footballd3/pitch";
import { createPassNetwork } from "footballd3/passNetwork";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { computePxPerYard } from "@/lib/pitch-scale";

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
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || width == null) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    // pxPerYard is derived from the measured column width, capped at 3.2 (the
    // desktop-tuned value that matches ShotMapPanel's width) — see FormationPanel
    // for the same math.
    const padding = 24;
    const pitch = createPitch(svg, {
      mode: "full",
      orientation: "vertical",
      flipAttack: true,
      pxPerYard: computePxPerYard(width, 80, padding, 3.2),
      padding,
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
  }, [data, colorToken, resolvedTheme, width, containerRef]);

  return <div ref={containerRef} data-testid="pass-network-panel" className="flex justify-center" />;
}
