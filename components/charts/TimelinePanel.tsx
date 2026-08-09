"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createHighlightReel } from "footballd3/highlightReel";
import { createScrubber } from "footballd3/scrubber";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import type { PlayerEvent } from "@/lib/playerEvents";

// The reel's inactive-progress-dot color — not part of the shared
// CHART_THEME token set since nothing else in the app currently needs it.
const INACTIVE_DOT_COLOR = { light: "#D6D3CC", dark: "#403A32" };

// "all" mode has far more steps than "highlights" (every event, not a
// curated top-5), so it plays at the master scrubber's old faster cadence;
// "highlights" keeps the reel's original pace.
const HIGHLIGHTS_STEP_MS = 1800;
const ALL_EVENTS_STEP_MS = 900;

export type TimelineMode = "highlights" | "all";

type ReelController = { play: () => void; pause: () => void; step: (delta: number) => void };
type TrackController = { seek: (minute: number) => void };

type TimelinePanelProps = {
  /** Full (not scrub-filtered) player events — both the reel and the drag-track density ticks use the whole match. */
  events: PlayerEvent[];
  maxMinute: number;
  scrubbedMinute: number;
  /** "highlights" (curated top-5) or "all" (every event) — owned by the parent, surfaced as a toggle in the card's title row. */
  mode: TimelineMode;
  onScrub: (minute: number) => void;
  onHoverEvent: (eventId: string | null) => void;
};

/**
 * Combined Timeline card body: a highlight-reel-style playback control (see
 * `mode`) above a drag-track for direct manual scrubbing. Replaces the
 * former separate Highlight Reel and Master Timeline cards, which each
 * surfaced their own Play button and their own way of reading out "here's
 * where we are" — this is one shared control for both.
 *
 * The drag-track mounts only on structural changes (container width, theme,
 * a new player's events/maxMinute) rather than on every scrubbedMinute
 * change — an active drag gesture must not be interrupted by a remount (see
 * scrubber.js's own docs, and the former MasterScrubberPanel this replaces).
 * The reel display has no such constraint (no drag, no scroll position to
 * preserve), so it simply remounts on a `mode` change — much simpler than an
 * imperative update() call for what's just a parent-owned toggle click.
 *
 * A manual drag on the track calls the reel's own pause() first, mirroring
 * the "a genuine user scrub stops any running playback" invariant the old
 * MasterScrubberPanel enforced for its own (now-removed) autoplay.
 */
export function TimelinePanel({ events, maxMinute, scrubbedMinute, mode, onScrub, onHoverEvent }: TimelinePanelProps) {
  const { resolvedTheme } = useTheme();

  const reelContainerRef = useRef<HTMLDivElement | null>(null);
  const reelCtlRef = useRef<ReelController | null>(null);
  const onHoverEventRef = useRef(onHoverEvent);
  useEffect(() => {
    onHoverEventRef.current = onHoverEvent;
  });

  const { ref: trackContainerRef, width } = useContainerWidth<HTMLDivElement>();
  const trackCtlRef = useRef<TrackController | null>(null);
  const onScrubRef = useRef(onScrub);
  useEffect(() => {
    onScrubRef.current = onScrub;
  });

  useEffect(() => {
    const container = reelContainerRef.current;
    if (!container) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    const ctl = createHighlightReel(
      container$,
      { events },
      {
        mode,
        stepDurationMs: mode === "all" ? ALL_EVENTS_STEP_MS : HIGHLIGHTS_STEP_MS,
        onScrubTo: (minute: number) => onScrubRef.current(minute),
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
    reelCtlRef.current = ctl as unknown as ReelController;

    return () => {
      // pause() first: createHighlightReel's play() starts a setInterval
      // entirely inside its own closure, independent of React — removing
      // the DOM and dropping the ref does NOT stop it. Without this, Play
      // left running when this effect tears down (a player switch, mode
      // toggle, or theme toggle) kept firing onScrubTo with the OLD
      // player's moments, silently overwriting the new player's scrub
      // position on a timer.
      reelCtlRef.current?.pause();
      container$.selectAll("*").remove();
      reelCtlRef.current = null;
    };
  }, [events, mode, resolvedTheme]);

  useEffect(() => {
    const container = trackContainerRef.current;
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
      onScrub: (minute: number) => {
        reelCtlRef.current?.pause();
        onScrubRef.current(minute);
      },
    });
    // scrubber.js has no .d.ts — TS infers its return shape from JSDoc, where
    // seek/update are typed as the generic `Function`, not a callable
    // signature. Cast once here rather than widen TrackController itself.
    trackCtlRef.current = ctl as unknown as TrackController;

    return () => {
      container$.selectAll("*").remove();
      trackCtlRef.current = null;
    };
    // scrubbedMinute is intentionally the initial position only, not a
    // re-mount trigger — see the seek() effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, maxMinute, resolvedTheme, width, trackContainerRef]);

  useEffect(() => {
    trackCtlRef.current?.seek(scrubbedMinute);
  }, [scrubbedMinute]);

  return (
    <div className="flex flex-col gap-3">
      <div ref={reelContainerRef} data-testid="highlight-reel-panel" />
      <div ref={trackContainerRef} data-testid="master-scrubber-panel" className="min-w-0" />
    </div>
  );
}
