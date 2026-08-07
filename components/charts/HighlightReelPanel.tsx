"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { createHighlightReel } from "footballd3/highlightReel";
import type { PlayerEvent } from "@/lib/playerEvents";

type Moment = { minute: number };

type HighlightReelPanelProps = {
  /** Full (not scrub-filtered) player events — the reel selects its own moments from the whole match. */
  events: PlayerEvent[];
  /** Fires once when Play begins, before the first moment — reset the master scrubber to 0. */
  onReset: () => void;
  /** Fires on every step (Play advancing, or a manual prev/next/dot click) — move the master scrubber. */
  onMoment: (moment: Moment) => void;
};

export function HighlightReelPanel({ events, onReset, onMoment }: HighlightReelPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Ref-wrapped so identity churn in the parent's inline callbacks (which
  // change on every scrub tick, since onMoment ultimately calls
  // setScrubbedMinute) never appears in this effect's dependency array —
  // otherwise a remount mid-Play would kill the reel's internal step timer.
  const onResetRef = useRef(onReset);
  const onMomentRef = useRef(onMoment);
  useEffect(() => {
    onResetRef.current = onReset;
    onMomentRef.current = onMoment;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    createHighlightReel(
      container$,
      { events },
      {
        onReset: () => onResetRef.current(),
        onMoment: (moment: Moment) => onMomentRef.current(moment),
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events]);

  return <div ref={containerRef} data-testid="highlight-reel-panel" />;
}
