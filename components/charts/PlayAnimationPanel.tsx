"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPitch } from "footballd3/pitch";
import { createPlayAnimation } from "footballd3/playAnimation";
import { CHART_THEME } from "@/lib/chart-theme";
import { MAX_PX_PER_YARD } from "@/lib/pitch-scale";
import { ToggleGroup } from "@/components/charts/ToggleGroup";

export type GoalClip = {
  window: {
    anchor_event_id: string;
    start_event_id: string;
    end_event_id: string;
    period: number;
    window_seconds: number;
    t_span_seconds: number;
  };
  frames: {
    event_id: string;
    t_seconds: number;
    team: string;
    event_type: string;
    ball_x: number;
    ball_y: number;
    ball_end_x: number | null;
    ball_end_y: number | null;
    actor: string;
    outcome: string | null;
  }[];
  context: {
    goal?: { event_id: string; minute: number; second: number; scorer: string; team: string };
  };
};

type AnimController = {
  controls: { play: () => void; pause: () => void; seek: (t: number) => void };
};

export function PlayAnimationPanel({
  goals,
  isActive = true,
}: {
  goals: GoalClip[];
  isActive?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AnimController | null>(null);
  const scrubberRef = useRef<HTMLInputElement>(null);
  const timeLabelRef = useRef<HTMLSpanElement>(null);
  const { resolvedTheme } = useTheme();
  const [activeGoalIdx, setActiveGoalIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    const pitch = createPitch(svg, {
      pxPerYard: MAX_PX_PER_YARD,
      theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.1 },
    });

    // The frame-by-frame tween itself lives inside footballd3 (createPlayAnimation) —
    // wiring its internal timing to --motion-* / prefers-reduced-motion directly is
    // FD3-3 (library-internal, out of scope here). Until that lands, reduced-motion
    // users get the same effect from the site side: a very high playbackSpeed
    // collapses the interpolation to effectively instant while leaving the
    // scrubber/transport (already seek-based, not animation-based) fully usable.
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const anim = createPlayAnimation(pitch, goals[activeGoalIdx], {
      playbackSpeed: reducedMotion ? 50 : 2.0,
      ballColor: theme.elevated,
      ballStroke: theme.text,
      actorColor: theme.focal,
      onTimeUpdate: (t: number) => {
        if (scrubberRef.current) scrubberRef.current.value = String(t);
        if (timeLabelRef.current) timeLabelRef.current.textContent = `${t.toFixed(1)}s`;
      },
    });
    controllerRef.current = anim;
    setPlaying(false);

    return () => {
      controllerRef.current = null;
      container$.selectAll("*").remove();
    };
  }, [goals, activeGoalIdx, resolvedTheme]);

  useEffect(() => {
    // Syncing local state to the external d3 animation's now-paused status, not
    // reacting to our own state — the documented exception to this rule.
    if (!isActive) {
      controllerRef.current?.controls.pause();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaying(false);
    }
  }, [isActive]);

  const clip = goals[activeGoalIdx];

  function togglePlay() {
    if (playing) {
      controllerRef.current?.controls.pause();
      setPlaying(false);
    } else {
      controllerRef.current?.controls.play();
      setPlaying(true);
    }
  }

  function selectGoal(idxStr: string) {
    controllerRef.current?.controls.pause();
    setPlaying(false);
    setActiveGoalIdx(Number(idxStr));
  }

  return (
    <div>
      <div className="mb-2.5">
        <ToggleGroup
          options={goals.map((g, i) => ({
            value: String(i),
            label: g.context.goal ? `${g.context.goal.scorer} ${g.context.goal.minute}'` : `Goal ${i + 1}`,
          }))}
          value={String(activeGoalIdx)}
          onChange={selectGoal}
        />
      </div>
      <div
        ref={containerRef}
        className="flex justify-center"
        role="img"
        aria-label="Goal play animation — ball and player movement leading to the goal"
      />
      <div className="mt-2.5 flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          aria-pressed={playing}
          className="shrink-0 rounded-[3px] border border-border bg-elevated px-2.5 py-1 font-mono text-mono-sm text-text"
        >
          {playing ? "❚❚ Pause" : "▶ Play"}
        </button>
        <input
          ref={scrubberRef}
          type="range"
          min={0}
          max={clip.window.t_span_seconds}
          step={0.1}
          defaultValue={0}
          onChange={(e) => controllerRef.current?.controls.seek(Number(e.target.value))}
          aria-label="Play animation scrub position, seconds"
          className="flex-1"
        />
        <span ref={timeLabelRef} className="w-10 shrink-0 font-mono text-mono-sm text-faint">
          0.0s
        </span>
      </div>
    </div>
  );
}
