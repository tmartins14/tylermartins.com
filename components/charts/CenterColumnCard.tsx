"use client";

import { useState } from "react";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import { MatchStatsRows, type MatchStatsData } from "@/components/charts/MatchStatsRows";
import { MomentumBarPanel } from "@/components/charts/MomentumBarPanel";
import type { MomentumData } from "@/components/charts/MomentumChartPanel";
import { GoalsBuildupPanel } from "@/components/charts/GoalsBuildupPanel";
import type { GoalClip } from "@/components/charts/PlayAnimationPanel";
import { CumulativeXgPanel, type CumulativeXgData } from "@/components/charts/CumulativeXgPanel";

type View = "stats" | "momentum" | "goals";

export function CenterColumnCard({
  matchStats,
  momentum,
  goals,
  cumulativeXg,
  upperHeight = 226,
}: {
  matchStats: MatchStatsData;
  momentum: MomentumData;
  goals: GoalClip[];
  cumulativeXg: CumulativeXgData;
  upperHeight?: number;
}) {
  const [view, setView] = useState<View>("stats");

  return (
    <div className="flex flex-col rounded-[14px] border border-border bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">Match</div>
          <div className="display mt-0.5 text-[19px] font-semibold">Story of the game</div>
        </div>
        <ToggleGroup
          options={[
            { value: "stats", label: "Stats" },
            { value: "momentum", label: "Momentum" },
            { value: "goals", label: "Goals" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      <div
        style={{ height: upperHeight, overflow: "hidden" }}
        className="flex flex-col justify-center"
      >
        <div className={view === "stats" ? "h-full" : "hidden"}>
          <MatchStatsRows data={matchStats} />
        </div>
        <div className={view === "momentum" ? "h-full" : "hidden"}>
          <MomentumBarPanel data={momentum} />
        </div>
        <div className={view === "goals" ? "" : "hidden"}>
          <GoalsBuildupPanel goals={goals} cumulativeXgPoints={cumulativeXg.points} />
        </div>
      </div>

      <div className="mt-4 flex min-h-[160px] flex-1 flex-col border-t border-border pt-3.5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
            Cumulative xG · race
          </span>
          <span className="font-mono text-[10px] text-faint">always on</span>
        </div>
        <CumulativeXgPanel data={cumulativeXg} />
      </div>
    </div>
  );
}
