"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPassSonar } from "footballd3/passSonar";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import type { PlayerEvent } from "@/lib/playerEvents";

type PassSonarPanelProps = {
  /** Scrub-filtered player events (minute <= scrubbedMinute). */
  events: PlayerEvent[];
  hoveredEventId: string | null;
  onHoverEvent: (eventIds: string[] | null) => void;
};

const MAX_SIZE = 280;

export function PassSonarPanel({ events, hoveredEventId, onHoverEvent }: PassSonarPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !width) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    const size = Math.min(MAX_SIZE, width);
    createPassSonar(
      container$,
      { events },
      {
        width: size,
        height: size,
        attemptedColor: theme.focal,
        completedColor: theme.focal,
        highlightColor: theme.secondary,
        highlightEventId: hoveredEventId,
        onHover: (hover: { eventIds: string[] } | null) => onHoverEvent(hover?.eventIds ?? null),
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, hoveredEventId, onHoverEvent, resolvedTheme, width, containerRef]);

  return <div ref={containerRef} data-testid="pass-sonar-panel" className="flex justify-center" />;
}
