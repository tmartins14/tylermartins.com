"use client";

import { useState } from "react";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import { MatchStatsPanel, type MatchStatsData } from "@/components/charts/MatchStatsPanel";
import { MomentumChartPanel, type MomentumData } from "@/components/charts/MomentumChartPanel";
import { PlayAnimationPanel, type GoalClip } from "@/components/charts/PlayAnimationPanel";

type View = "stats" | "momentum" | "animation";

export function CenterColumnCard({
  matchStats,
  momentum,
  goals,
}: {
  matchStats: MatchStatsData;
  momentum: MomentumData;
  goals: GoalClip[];
}) {
  const [view, setView] = useState<View>("stats");

  return (
    <ChartFrame
      kicker="Center"
      kickerColor="muted"
      right={
        <ToggleGroup
          options={[
            { value: "stats", label: "Match Stats" },
            { value: "momentum", label: "Momentum" },
            { value: "animation", label: "Goal Animation" },
          ]}
          value={view}
          onChange={setView}
        />
      }
    >
      <div className={view === "stats" ? "" : "hidden"}>
        <MatchStatsPanel data={matchStats} />
      </div>
      <div className={view === "momentum" ? "" : "hidden"}>
        <MomentumChartPanel data={momentum} />
      </div>
      <div className={view === "animation" ? "" : "hidden"}>
        <PlayAnimationPanel goals={goals} isActive={view === "animation"} />
      </div>
    </ChartFrame>
  );
}
