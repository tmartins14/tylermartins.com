import matchStatsData from "@/data/football/match_stats_3943043.json";
import shotsData from "@/data/football/shots_3943043.json";
import momentumData from "@/data/football/momentum_3943043.json";
import passNetworkSpainData from "@/data/football/pass_network_3943043_Spain.json";
import passNetworkEnglandData from "@/data/football/pass_network_3943043_England.json";
import formationSpainData from "@/data/football/formation_3943043_spain.json";
import formationEnglandData from "@/data/football/formation_3943043_england.json";
import teamShapeSpainData from "@/data/football/team_shape_3943043_spain.json";
import teamShapeEnglandData from "@/data/football/team_shape_3943043_england.json";
import goalAnimationData from "@/data/football/goal_animation_3943043.json";

import { TeamColumnCard } from "@/components/charts/TeamColumnCard";
import { CenterColumnCard } from "@/components/charts/CenterColumnCard";
import { type Shot } from "@/components/charts/ShotMapPanel";
import { type MatchStatsData } from "@/components/charts/MatchStatsPanel";
import { type GoalClip } from "@/components/charts/PlayAnimationPanel";
import { StatsBombAttribution } from "@/components/StatsBombAttribution";

export default function MatchDashboard() {
  const matchStats = matchStatsData as MatchStatsData;
  const { home, away, metadata } = matchStats;
  const shots = shotsData as Shot[];
  const homeShots = shots.filter((s) => s.team === home.team);
  const awayShots = shots.filter((s) => s.team === away.team);
  const goals = goalAnimationData.goals as GoalClip[];

  return (
    <div className="px-9 pt-10 pb-10">
      {/* Match header */}
      <div className="mb-[22px] flex flex-wrap items-center justify-between gap-5 rounded-xl border border-border bg-surface px-7 py-6">
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-display text-2xl font-semibold">{home.team}</div>
          </div>
          <div className="font-display text-4xl font-black tracking-[0.02em]">
            <span className="text-focal">{home.score}</span>{" "}
            <span className="text-2xl text-faint">—</span>{" "}
            <span className="text-secondary">{away.score}</span>
          </div>
          <div>
            <div className="font-display text-2xl font-semibold">{away.team}</div>
          </div>
        </div>
        <div className="text-right font-mono text-xs leading-[1.7] text-muted">
          {metadata.competition}
          <br />
          <span className="text-faint">{metadata.match_label}</span>
        </div>
      </div>

      {/* 3-column layout: Spain | Center | England */}
      <div className="grid grid-cols-1 gap-[18px] lg:[grid-template-columns:1fr_clamp(300px,26%,420px)_1fr]">
        <TeamColumnCard
          teamName={home.team}
          colorToken="focal"
          formation={formationSpainData}
          passNetwork={passNetworkSpainData}
          teamShape={teamShapeSpainData}
          shots={homeShots}
        />

        <CenterColumnCard matchStats={matchStats} momentum={momentumData} goals={goals} />

        <TeamColumnCard
          teamName={away.team}
          colorToken="secondary"
          formation={formationEnglandData}
          passNetwork={passNetworkEnglandData}
          teamShape={teamShapeEnglandData}
          shots={awayShots}
        />
      </div>

      <StatsBombAttribution
        variant="row"
        size={18}
        className="mt-6"
        rightNote="Sample dataset · committed to repo · reproducible"
      />
    </div>
  );
}
