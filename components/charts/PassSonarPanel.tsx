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
  /** Selected player's team — drives the wedge color (Spain red / England blue). */
  playerTeam: "Spain" | "England";
  hoveredEventId: string | null;
  onHoverEvent: (eventIds: string[] | null) => void;
};

const MAX_SIZE = 280;

export function PassSonarPanel({ events, playerTeam, hoveredEventId, onHoverEvent }: PassSonarPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !width) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const teamColor = theme[playerTeam === "Spain" ? "spain" : "england"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    const size = Math.min(MAX_SIZE, width);
    createPassSonar(
      container$,
      { events },
      {
        width: size,
        height: size,
        attemptedColor: teamColor,
        completedColor: teamColor,
        // focal (not secondary) — see CumulativeXtPanel's comment.
        highlightColor: theme.focal,
        highlightEventId: hoveredEventId,
        onHover: (hover: { eventIds: string[] } | null) => onHoverEvent(hover?.eventIds ?? null),
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, playerTeam, hoveredEventId, onHoverEvent, resolvedTheme, width, containerRef]);

  return <div ref={containerRef} data-testid="pass-sonar-panel" className="flex justify-center" />;
}
