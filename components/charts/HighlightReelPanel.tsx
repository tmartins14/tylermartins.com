"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createHighlightReel } from "footballd3/highlightReel";
import { CHART_THEME } from "@/lib/chart-theme";
import type { PlayerEvent } from "@/lib/playerEvents";

// The reel's inactive-progress-dot color — not part of the shared
// CHART_THEME token set since nothing else in the app currently needs it.
const INACTIVE_DOT_COLOR = { light: "#D6D3CC", dark: "#403A32" };

type HighlightReelPanelProps = {
  /** Full (not scrub-filtered) player events — the reel selects its own moments from the whole match. */
  events: PlayerEvent[];
  /** Player's team encoding color — accepted for API-shape parity with the design spec, but not visually used by the reel itself. */
  teamColor?: string;
  /** Fires on every step (Play advancing, or a manual prev/next/dot click) — move the master scrubber. */
  onScrubTo: (minute: number) => void;
  /** Fires on hover/unhover of the current moment's description — cross-highlight the matching event elsewhere on the page. */
  onHoverEvent: (eventId: string | null) => void;
};

export function HighlightReelPanel({ events, onScrubTo, onHoverEvent }: HighlightReelPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  // Ref-wrapped so identity churn in the parent's inline callbacks (which
  // change on every scrub tick, since onScrubTo ultimately calls
  // setScrubbedMinute) never appears in this effect's dependency array —
  // otherwise a remount mid-Play would kill the reel's internal step timer.
  const onScrubToRef = useRef(onScrubTo);
  const onHoverEventRef = useRef(onHoverEvent);
  useEffect(() => {
    onScrubToRef.current = onScrubTo;
    onHoverEventRef.current = onHoverEvent;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    createHighlightReel(
      container$,
      { events },
      {
        onScrubTo: (minute: number) => onScrubToRef.current(minute),
        onHoverEvent: (eventId: string | null) => onHoverEventRef.current(eventId),
        borderColor: theme.border,
        buttonBackground: theme.elevated,
        textColor: theme.text,
        faintColor: theme.faint,
        focalColor: theme.focal,
        focalTextColor: theme.background,
        inactiveDotColor: resolvedTheme === "dark" ? INACTIVE_DOT_COLOR.dark : INACTIVE_DOT_COLOR.light,
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, resolvedTheme]);

  return <div ref={containerRef} data-testid="highlight-reel-panel" />;
}
