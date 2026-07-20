import { GoalTimeline } from "@/components/charts/GoalTimeline";

type TeamHeader = { team: string; score: number; xg: number };
type Goal = { minute: number; team: string; player: string };

export function MatchHeaderHero({
  home,
  away,
  competition,
  venue,
  date,
  goals,
}: {
  home: TeamHeader;
  away: TeamHeader;
  competition: string;
  venue: string;
  date: string;
  goals: Goal[];
}) {
  return (
    <div className="mb-5 rounded-[14px] border border-border bg-surface px-7 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="font-mono text-[11px] tracking-[0.14em] text-focal uppercase">
          {competition}
        </div>
        <div className="text-right font-mono text-[11px] text-faint">
          {venue}
          <br />
          {date}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-center gap-10">
        <div className="text-right">
          <div className="display text-[32px] leading-none">{home.team}</div>
          <div className="mt-1 font-mono text-[11px] text-faint">xG {home.xg.toFixed(2)}</div>
        </div>
        <div className="display text-[48px] leading-none">
          <span className="text-focal">{home.score}</span>{" "}
          <span className="text-[27px] text-faint">–</span>{" "}
          <span className="text-secondary">{away.score}</span>
        </div>
        <div className="text-left">
          <div className="display text-[32px] leading-none">{away.team}</div>
          <div className="mt-1 font-mono text-[11px] text-faint">xG {away.xg.toFixed(2)}</div>
        </div>
      </div>

      <GoalTimeline goals={goals} homeTeam={home.team} />
    </div>
  );
}
