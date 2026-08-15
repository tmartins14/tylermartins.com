"use client";

import { useEffect, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createMomentumBarChart } from "footballd3/momentumBarChart";
import type { MomentumData } from "@/components/charts/MomentumChartPanel";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { kitEncoding } from "@/lib/kits";

type Bin = { start: number; end: number; value: number };

export function MomentumBarPanel({ data }: { data: MomentumData }) {
  const { ref: containerRef, width, height } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();
  const [hover, setHover] = useState<Bin | null>(null);
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const homeColor = kitEncoding("home", mode);
  const awayColor = kitEncoding("away", mode);

  useEffect(() => {
    const container = containerRef.current;
    // Skip while mounted-but-hidden (e.g. an inactive tab view, clientWidth/Height
    // read 0 there) — the ResizeObserver fires again with real dimensions once the
    // view becomes visible, re-running this effect.
    if (!container || !width || !height) return;

    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    createMomentumBarChart(container$, data, {
      width,
      height,
      orientation: "vertical",
      homeColor,
      awayColor,
      onHover: setHover,
    });

    return () => {
      container$.selectAll("*").remove();
    };
  }, [data, homeColor, awayColor, width, height, containerRef]);

  const readout = hover
    ? `${hover.start}'–${hover.end}' · ${hover.value >= 0 ? data.home_team : data.away_team} threat ${hover.value >= 0 ? "+" : ""}${hover.value.toFixed(2)}`
    : "Hover the chart · bars lean to the team on top";

  return (
    <div className="flex h-full flex-col">
      <div ref={containerRef} className="min-h-0 w-full flex-1" />
      <div className="mt-2 flex flex-wrap items-center gap-4 font-mono text-mono-sm text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: homeColor }} />
          {data.home_team}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: awayColor }} />
          {data.away_team}
        </span>
        <span className="text-faint">{readout}</span>
      </div>
    </div>
  );
}
