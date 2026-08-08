"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createScrubber } from "footballd3/scrubber";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import type { PlayerEvent } from "@/lib/playerEvents";

type ScrubberController = { seek: (minute: number) => void };

// Half the Highlight Reel's 1800ms cadence — this autoplay steps through
// every one of the player's own event minutes (not just 3-5 curated
// moments), so a match's worth of steps at the reel's slower pace felt
// sluggish; 2x speed here specifically.
const AUTOPLAY_STEP_MS = 900;

type MasterScrubberPanelProps = {
  /** Full (not scrub-filtered) player events, for density-hint ticks and autoplay's step sequence. */
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
 * reel playing, this panel's own autoplay, or React re-rendering after the
 * user's own drag already fired onScrub) go through the imperative seek()
 * instead, which moves the playhead without re-firing onScrub — see
 * scrubber.js's own docs.
 *
 * Autoplay (separate from the Highlight Reel's own Play, which jumps between
 * 3-5 curated moments) steps through every one of the player's own event
 * minutes in order — deduped, since many events share a minute — at the same
 * ~1800ms cadence the reel uses, calling the same onScrub prop the drag
 * handle already uses so every panel updates in lockstep. A genuine
 * drag/click/keyboard move through scrubber.js's own onScrub stops any
 * running autoplay first, the same stop-before-reposition pattern
 * highlightReel.js's step()/dot-click use.
 */
export function MasterScrubberPanel({ events, maxMinute, scrubbedMinute, onScrub }: MasterScrubberPanelProps) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();
  const ctlRef = useRef<ScrubberController | null>(null);
  const onScrubRef = useRef(onScrub);
  useEffect(() => {
    onScrubRef.current = onScrub;
  });

  const [playing, setPlaying] = useState(false);
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplayIndexRef = useRef(0);

  const uniqueMinutes = useMemo(
    () => Array.from(new Set(events.map((e) => e.minute))).sort((a, b) => a - b),
    [events]
  );

  function stopAutoplay() {
    if (autoplayIntervalRef.current !== null) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
    setPlaying(false);
  }

  // Ref-wrapped so the D3-mount effect below can stop autoplay from its
  // onScrub handler without needing stopAutoplay in its own dependency
  // array — it must NOT re-run on every render just because this function
  // identity changed.
  const stopAutoplayRef = useRef(stopAutoplay);
  useEffect(() => {
    stopAutoplayRef.current = stopAutoplay;
  });

  function toggleAutoplay() {
    if (playing) {
      stopAutoplay();
      return;
    }
    if (!uniqueMinutes.length) return;
    setPlaying(true);
    autoplayIndexRef.current = 0;
    onScrubRef.current(uniqueMinutes[0]);
    autoplayIntervalRef.current = setInterval(() => {
      const next = autoplayIndexRef.current + 1;
      if (next >= uniqueMinutes.length) {
        stopAutoplay();
        return;
      }
      autoplayIndexRef.current = next;
      onScrubRef.current(uniqueMinutes[next]);
    }, AUTOPLAY_STEP_MS);
  }

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
      onScrub: (minute: number) => {
        stopAutoplayRef.current();
        onScrubRef.current(minute);
      },
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
    // re-mount trigger — see the seek() effect below. This cleanup is pure
    // DOM teardown on purpose: it must NOT also stop autoplay, since `width`
    // (from useContainerWidth's ResizeObserver, which has no equality check)
    // can change for reasons that have nothing to do with the user wanting
    // to stop playback — any sibling panel resizing as scrubbedMinute
    // changes can ripple into a sub-pixel width change here, and stopping
    // autoplay on every one of those made Play silently die after one step.
    // See the events-keyed effect below for the real "stop autoplay" cases.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, maxMinute, resolvedTheme, width, containerRef]);

  useEffect(() => {
    ctlRef.current?.seek(scrubbedMinute);
  }, [scrubbedMinute]);

  // Stop autoplay only on a genuine new-player selection (events truly
  // change) or a true unmount (popup closed) — not on the incidental width/
  // theme remounts the effect above handles.
  useEffect(() => {
    return () => stopAutoplayRef.current();
  }, [events]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        data-testid="master-scrubber-play"
        onClick={toggleAutoplay}
        className="min-w-[70px] rounded-[6px] border border-focal bg-focal px-2.5 py-1.5 font-mono text-[13px] text-background"
      >
        {playing ? "❚❚ Stop" : "▶ Play"}
      </button>
      <div ref={containerRef} data-testid="master-scrubber-panel" className="min-w-0 flex-1" />
    </div>
  );
}
