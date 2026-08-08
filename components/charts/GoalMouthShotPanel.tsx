"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createGoalMouthShotPanel } from "footballd3/goalMouthShotPanel";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import type { PlayerEvent } from "@/lib/playerEvents";

type GoalMouthShotPanelProps = {
  /** Scrub-filtered player events (minute <= scrubbedMinute). */
  events: PlayerEvent[];
  hoveredEventId: string | null;
  onHoverEvent: (eventId: string | null) => void;
};

export function GoalMouthShotPanel({ events, hoveredEventId, onHoverEvent }: GoalMouthShotPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !width) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    createGoalMouthShotPanel(
      container$,
      { events },
      {
        width,
        frameColor: theme.secondary,
        onTargetColor: theme.muted,
        goalColor: theme.focal,
        highlightColor: theme.secondary,
        highlightEventId: hoveredEventId,
        onHover: onHoverEvent,
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, hoveredEventId, onHoverEvent, resolvedTheme, width, containerRef]);

  return <div ref={containerRef} data-testid="goal-mouth-shot-panel" />;
}
