"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPitch } from "footballd3/pitch";
import { createPlayAnimation } from "footballd3/playAnimation";
import { CHART_THEME } from "@/lib/chart-theme";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import type { GoalClip } from "@/components/charts/PlayAnimationPanel";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { computePxPerYard } from "@/lib/pitch-scale";

type CumulativeXgPoint = {
  minute: number;
  team: string;
  display_name: string;
  xg: number;
  outcome: string;
  is_goal: boolean;
};

type SeekController = { controls: { seek: (t: number) => void } };

/** Assist heuristic: the actor of the last Pass-type frame before the goal frame. */
function findAssist(clip: GoalClip): string | null {
  for (let i = clip.frames.length - 2; i >= 0; i--) {
    if (clip.frames[i].event_type === "Pass") return clip.frames[i].actor;
  }
  return null;
}

/** Real xG for this goal, matched by team + minute + is_goal from cumulative_xg data. */
function findGoalXg(clip: GoalClip, points: CumulativeXgPoint[]): number | null {
  const goal = clip.context.goal;
  if (!goal) return null;
  const match = points.find(
    (p) => p.is_goal && p.team === goal.team && p.minute === goal.minute
  );
  return match ? match.xg : null;
}

export function GoalsBuildupPanel({
  goals,
  cumulativeXgPoints,
}: {
  goals: GoalClip[];
  cumulativeXgPoints: CumulativeXgPoint[];
}) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const controllerRef = useRef<SeekController | null>(null);
  const { resolvedTheme } = useTheme();
  const [activeGoalIdx, setActiveGoalIdx] = useState(0);
  const [step, setStep] = useState(goals[0].frames.length - 1);

  const clip = goals[activeGoalIdx];

  // Mount once per goal/theme/width change — step changes below drive seek() on the
  // already-mounted instance instead of remounting.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || width == null) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");

    // This view has more surrounding chrome than the other upperHeight-constrained
    // views (goal-chip row + slider + readout all share the height budget with the
    // pitch itself), so the pitch gets a smaller slice — pxPerYard capped at 1.25
    // (the desktop-tuned value), horizontal/full mode so the axis is 120 yards.
    const padding = 6;
    const pitch = createPitch(svg, {
      pxPerYard: computePxPerYard(width, 120, padding, 1.25),
      padding,
      theme: { background: theme.elevated, lines: theme.pitch, lineWeight: 1.1 },
    });

    const anim = createPlayAnimation(pitch, clip, {
      ballColor: theme.elevated,
      ballStroke: theme.text,
      actorColor: theme.focal,
    });
    controllerRef.current = anim;

    const frame = clip.frames[Math.min(step, clip.frames.length - 1)];
    anim.controls.seek(frame.t_seconds);

    return () => {
      controllerRef.current = null;
      container$.selectAll("*").remove();
    };
    // step intentionally excluded — driven imperatively by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip, resolvedTheme, width]);

  useEffect(() => {
    const frame = clip.frames[Math.min(step, clip.frames.length - 1)];
    controllerRef.current?.controls.seek(frame.t_seconds);
  }, [step, clip]);

  function selectGoal(idxStr: string) {
    const idx = Number(idxStr);
    setActiveGoalIdx(idx);
    setStep(goals[idx].frames.length - 1);
  }

  const goal = clip.context.goal;
  const assist = findAssist(clip);
  const xg = findGoalXg(clip, cumulativeXgPoints);

  return (
    <div>
      <div className="mb-3">
        <ToggleGroup
          options={goals.map((g, i) => ({
            value: String(i),
            label: g.context.goal
              ? `${g.context.goal.minute}' ${g.context.goal.scorer.split(" ").slice(-1)[0]}`
              : `Goal ${i + 1}`,
          }))}
          value={String(activeGoalIdx)}
          onChange={selectGoal}
        />
      </div>
      <div ref={containerRef} data-testid="goals-buildup-panel" className="flex justify-center" />
      <input
        type="range"
        min={0}
        max={clip.frames.length - 1}
        value={step}
        onChange={(e) => setStep(Number(e.target.value))}
        className="mt-2.5 w-full accent-focal"
      />
      {goal ? (
        <div className="mt-2 font-mono text-[11px] text-muted">
          <span className="text-focal">
            {goal.scorer} {goal.minute}&apos;
          </span>
          {assist ? ` · assist ${assist}` : ""}
          {xg !== null ? ` · xG ${xg.toFixed(2)}` : ""} · {goal.team}
        </div>
      ) : null}
    </div>
  );
}
