import { GoalTimeline } from "@/components/charts/GoalTimeline";

type TeamHeader = { team: string; score: number; xg: number };
type Goal = { minute: number; team: string; player: string };

/** Compact sticky header for the mobile tabbed layout — same data as MatchHeaderHero,
 * smaller scoreline, no venue/date row, no card chrome (the sticky bar supplies its own). */
export function MobileMatchHeader({
  home,
  away,
  competition,
  goals,
}: {
  home: TeamHeader;
  away: TeamHeader;
  competition: string;
  goals: Goal[];
}) {
  return (
    <div>
      <div className="mb-2 text-center font-mono text-mono-xs tracking-[0.14em] text-focal uppercase">
        {competition}
      </div>
      <div className="flex items-center justify-center gap-6">
        <div className="text-right">
          <div className="display text-display-4 leading-none">{home.team}</div>
          <div className="mt-0.5 font-mono text-mono-xs text-faint">xG {home.xg.toFixed(2)}</div>
        </div>
        <div className="display text-display-2 leading-none">
          <span className="text-focal">{home.score}</span>{" "}
          <span className="text-display-4 text-faint">–</span>{" "}
          <span className="text-secondary">{away.score}</span>
        </div>
        <div className="text-left">
          <div className="display text-display-4 leading-none">{away.team}</div>
          <div className="mt-0.5 font-mono text-mono-xs text-faint">xG {away.xg.toFixed(2)}</div>
        </div>
      </div>
      <div className="mt-2">
        <GoalTimeline goals={goals} homeTeam={home.team} />
      </div>
    </div>
  );
}
