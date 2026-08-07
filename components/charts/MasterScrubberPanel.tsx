"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createScrubber } from "footballd3/scrubber";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import type { PlayerEvent } from "@/lib/playerEvents";

type ScrubberController = { seek: (minute: number) => void };

type MasterScrubberPanelProps = {
  /** Full (not scrub-filtered) player events, for density-hint ticks. */
  events: PlayerEvent[];
  maxMinute: number;
  scrubbedMinute: number;
  onScrub: (minute: number) => void;
};

/**
 * The one component on this page that must NOT fully remount on every
 * scrubbedMinute change: scrubber.js owns an active drag gesture mid-move,
 * and re-creating its SVG on every pixel of a drag would abort the drag.
 * Mount/remount only on structural changes (container width, theme, a new
 * player's events/maxMinute); externally-driven scrub moves (the highlight
 * reel playing, or React re-rendering after the user's own drag already
 * fired onScrub) go through the imperative seek() instead, which moves the
 * playhead without re-firing onScrub — see scrubber.js's own docs.
 */
export function MasterScrubberPanel({ events, maxMinute, scrubbedMinute, onScrub }: MasterScrubberPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();
  const ctlRef = useRef<ScrubberController | null>(null);
  const onScrubRef = useRef(onScrub);
  useEffect(() => {
    onScrubRef.current = onScrub;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || width == null) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    const ctl = createScrubber(container$, {
      width,
      minMinute: 0,
      maxMinute,
      initialMinute: scrubbedMinute,
      events,
      trackColor: theme.border,
      playedColor: theme.focal,
      handleColor: theme.focal,
      onScrub: (minute: number) => onScrubRef.current(minute),
    });
    // scrubber.js has no .d.ts — TS infers its return shape from JSDoc, where
    // seek/update are typed as the generic `Function`, not a callable
    // signature. Cast once here rather than widen ScrubberController itself.
    ctlRef.current = ctl as unknown as ScrubberController;

    return () => {
      container$.selectAll("*").remove();
      ctlRef.current = null;
    };
    // scrubbedMinute is intentionally the initial position only, not a
    // re-mount trigger — see the seek() effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, maxMinute, resolvedTheme, width, containerRef]);

  useEffect(() => {
    ctlRef.current?.seek(scrubbedMinute);
  }, [scrubbedMinute]);

  return <div ref={containerRef} data-testid="master-scrubber-panel" />;
}
