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
import cumulativeXgData from "@/data/football/cumulative_xg_3943043.json";

import { MatchHeaderHero } from "@/components/charts/MatchHeaderHero";
import { MobileMatchHeader } from "@/components/charts/MobileMatchHeader";
import { MobileDashboardTabs } from "@/components/charts/MobileDashboardTabs";
import { TeamColumnCard } from "@/components/charts/TeamColumnCard";
import { CenterColumnCard } from "@/components/charts/CenterColumnCard";
import { type Shot } from "@/components/charts/ShotMapPanel";
import { type MatchStatsData } from "@/components/charts/MatchStatsRows";
import { type GoalClip } from "@/components/charts/PlayAnimationPanel";
import { type CumulativeXgData } from "@/components/charts/CumulativeXgPanel";
import { StatsBombAttribution } from "@/components/StatsBombAttribution";

// Tweakable props exposed by the design spec — defaults match "1A Broadcast".
const ALIGN_DIVIDERS = true;
// 432px: full-pitch team charts (Formation/Pass Net/Shape) are rendered true-scale
// at pxPerYard 3.2 to match the shot map's pitch width (304px) below the divider —
// see FormationPanel/TeamShapePanel/PassNetworkPanel. A true-scale 120yd-tall pitch
// at that width needs ~432px of height, so upperHeight grows with it (beyond the
// design doc's 200-320px range) to keep every divider aligned.
const UPPER_HEIGHT = 432;
const SHOT_SCALE = 1;

// Real, fixed facts about this specific historical match (not part of any current
// extraction contract) — not fabricated placeholders, just not yet piped through
// the Python side. Euro 2024 Final: Spain 2-1 England, Olympiastadion Berlin, 14 Jul 2024.
const VENUE = "Olympiastadion, Berlin";
const MATCH_DATE = "14 Jul 2024";

export default function MatchDashboard() {
  const matchStats = matchStatsData as MatchStatsData;
  const { home, away, metadata } = matchStats;
  const shots = shotsData as Shot[];
  const homeShots = shots.filter((s) => s.team === home.team);
  const awayShots = shots.filter((s) => s.team === away.team);
  const goals = goalAnimationData.goals as GoalClip[];
  const cumulativeXg = cumulativeXgData as CumulativeXgData;

  const xgRow = matchStats.rows.find((r) => r.label === "xG");
  const homeXg = xgRow?.home_value ?? 0;
  const awayXg = xgRow?.away_value ?? 0;

  const homeCard = (
    <TeamColumnCard
      teamName={home.team}
      colorToken="focal"
      formation={formationSpainData}
      passNetwork={passNetworkSpainData}
      teamShape={teamShapeSpainData}
      shots={homeShots}
      upperHeight={UPPER_HEIGHT}
      shotScale={SHOT_SCALE}
      defaultView="formation"
    />
  );
  const matchCard = (
    <CenterColumnCard
      matchStats={matchStats}
      momentum={momentumData}
      goals={goals}
      cumulativeXg={cumulativeXg}
      upperHeight={UPPER_HEIGHT}
    />
  );
  const awayCard = (
    <TeamColumnCard
      teamName={away.team}
      colorToken="secondary"
      formation={formationEnglandData}
      passNetwork={passNetworkEnglandData}
      teamShape={teamShapeEnglandData}
      shots={awayShots}
      upperHeight={UPPER_HEIGHT}
      shotScale={SHOT_SCALE}
      defaultView="formation"
    />
  );

  return (
    <div className="px-4 py-4 dash:px-9 dash:py-10">
      <div className="mx-auto max-w-[1180px] dash:overflow-hidden dash:rounded-2xl dash:border dash:border-border-strong dash:bg-background dash:px-[30px] dash:pt-[26px] dash:pb-[30px] dash:shadow-[0_40px_90px_-50px_rgba(23,23,23,0.55)]">
        <div className="hidden dash:block">
          <MatchHeaderHero
            home={{ team: home.team, score: home.score, xg: homeXg }}
            away={{ team: away.team, score: away.score, xg: awayXg }}
            competition={`${metadata.competition} · Final`}
            venue={VENUE}
            date={MATCH_DATE}
            goals={momentumData.goals}
          />
        </div>

        <div
          data-testid="mobile-match-header"
          className="sticky top-[var(--topbar-h)] z-4 border-b border-border bg-background/95 py-3 backdrop-blur-[8px] dash:hidden"
        >
          <MobileMatchHeader
            home={{ team: home.team, score: home.score, xg: homeXg }}
            away={{ team: away.team, score: away.score, xg: awayXg }}
            competition={`${metadata.competition} · Final`}
            goals={momentumData.goals}
          />
          <div className="pointer-events-none absolute inset-x-0 top-full h-3 bg-gradient-to-b from-black/5 to-transparent" />
        </div>

        <div
          data-testid="dashboard-grid"
          className={`hidden gap-[18px] dash:grid dash:grid-cols-[minmax(0,1fr)_360px_minmax(0,1fr)] ${
            ALIGN_DIVIDERS ? "dash:items-stretch" : "dash:items-start"
          }`}
        >
          {homeCard}
          {matchCard}
          {awayCard}
        </div>

        <div className="mt-4 dash:hidden">
          <MobileDashboardTabs homeLabel={home.team} awayLabel={away.team} home={homeCard} match={matchCard} away={awayCard} />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatsBombAttribution size={16} />
            <span className="font-mono text-[11px] text-faint">
              {metadata.competition} Final · match {metadata.match_id} · sample dataset
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
