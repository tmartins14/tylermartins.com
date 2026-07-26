"use client";

import { useEffect, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createShotMap } from "footballd3/shotMap";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { computePxPerYard } from "@/lib/pitch-scale";

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
  shotScale?: number;
};

export function ShotMapPanel({ shots, colorToken, shotScale = 1 }: ShotMapPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();
  const [hover, setHover] = useState<Shot | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || width == null) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    // pxPerYard is derived from the measured column width, capped at 3.2 (the
    // desktop-tuned value) — padding matches createPitch's own default (24) so the
    // scale calc and the actual render stay in sync.
    createShotMap(svg, shots, {
      orientation: "vertical",
      pxPerYard: computePxPerYard(width, 80, 24, 3.2),
      theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.2 },
      color: theme[colorToken],
      styleMode: "tier",
      shotScale,
      mutedColor: theme.muted,
      showTooltip: false,
      onHover: setHover,
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [shots, colorToken, shotScale, resolvedTheme, width, containerRef]);

  const goalCount = shots.filter((s) => s.is_goal).length;
  const xgSum = shots.reduce((a, s) => a + s.xg, 0);
  const readout = hover
    ? `${hover.display_name} · ${hover.minute}' · xG ${hover.xg.toFixed(2)} · ${hover.outcome}`
    : `${shots.length} shots · ${goalCount} goals · xG ${xgSum.toFixed(2)}`;

  return (
    <div>
      <div ref={containerRef} data-testid="shot-map-panel" className="flex justify-center" />
      <div
        className="mt-2 font-mono text-[11px]"
        style={{ color: hover ? `var(--${colorToken})` : "var(--faint)" }}
      >
        {readout}
      </div>
    </div>
  );
}
