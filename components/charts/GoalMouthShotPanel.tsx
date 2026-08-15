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
  /** Selected player's team — drives the frame/goal-marker color (Spain red / England blue). */
  playerTeam: "Spain" | "England";
  hoveredEventId: string | null;
  onHoverEvent: (eventId: string | null) => void;
};

export function GoalMouthShotPanel({ events, playerTeam, hoveredEventId, onHoverEvent }: GoalMouthShotPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !width) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const teamColor = theme[playerTeam === "Spain" ? "spain" : "england"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    createGoalMouthShotPanel(
      container$,
      { events },
      {
        width,
        frameColor: teamColor,
        onTargetColor: theme.muted,
        goalColor: teamColor,
        // focal (not secondary) — see CumulativeXtPanel's comment.
        highlightColor: theme.focal,
        highlightEventId: hoveredEventId,
        onHover: onHoverEvent,
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, playerTeam, hoveredEventId, onHoverEvent, resolvedTheme, width, containerRef]);

  return (
    <div
      ref={containerRef}
      data-testid="goal-mouth-shot-panel"
      role="img"
      aria-label={`Shots on goal for ${playerTeam}'s selected player, viewed from the goal mouth`}
    />
  );
}
