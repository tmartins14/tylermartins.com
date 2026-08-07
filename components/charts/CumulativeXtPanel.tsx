"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createCumulativeXtChart } from "footballd3/cumulativeXtChart";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import type { PlayerEvent } from "@/lib/playerEvents";

type CumulativeXtPanelProps = {
  /** Scrub-filtered player events (minute <= scrubbedMinute). */
  events: PlayerEvent[];
  /** Shared master scrubber's maxMinute, so this chart's time axis aligns with every sibling panel. */
  finalMinute: number;
  hoveredEventId: string | null;
  onHoverEvent: (eventId: string | null) => void;
};

export function CumulativeXtPanel({ events, finalMinute, hoveredEventId, onHoverEvent }: CumulativeXtPanelProps) {
  const { ref: containerRef, width, height } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !width || !height) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    createCumulativeXtChart(
      container$,
      { events },
      {
        width,
        height,
        finalMinute,
        lineColor: theme.focal,
        shotColor: theme.muted,
        goalRingColor: theme.focal,
        highlightColor: theme.secondary,
        highlightEventId: hoveredEventId,
        showTooltip: false,
        onHover: (point: { event_id: string | null } | null) => onHoverEvent(point?.event_id ?? null),
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, finalMinute, hoveredEventId, onHoverEvent, resolvedTheme, width, height, containerRef]);

  return <div ref={containerRef} data-testid="cumulative-xt-panel" className="min-h-0 flex-1" />;
}
