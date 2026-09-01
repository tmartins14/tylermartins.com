import { GoalTimeline } from "@/components/charts/GoalTimeline";
import { MatchSummaryModal } from "@/components/charts/MatchSummaryModal";
import { type MatchSummaryData } from "@/components/charts/MatchSummaryPanel";

type TeamHeader = { team: string; score: number; xg: number };
type Goal = { minute: number; team: string; player: string };

export function MatchHeaderHero({
  home,
  away,
  competition,
  venue,
  date,
  goals,
  matchSummary,
}: {
  home: TeamHeader;
  away: TeamHeader;
  competition: string;
  venue: string;
  date: string;
  goals: Goal[];
  matchSummary: MatchSummaryData;
}) {
  return (
    <div className="mb-5 rounded-[14px] border border-border bg-surface px-7 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="font-mono text-mono-sm tracking-[0.14em] text-focal uppercase">
          {competition}
        </div>
        <div className="flex items-center gap-4">
          <MatchSummaryModal matchSummary={matchSummary} />
          <div className="text-right font-mono text-mono-sm text-faint">
            {venue}
            <br />
            {date}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col items-center gap-2 dash:flex-row dash:justify-center dash:gap-10">
        <div className="text-right">
          <div className="display text-display-2 leading-none">{home.team}</div>
          <div className="mt-1 font-mono text-mono-sm text-faint">xG {home.xg.toFixed(2)}</div>
        </div>
        <div className="display text-score leading-none">
          <span className="text-focal">{home.score}</span>{" "}
          <span className="text-display-3 text-faint">–</span>{" "}
          <span className="text-secondary">{away.score}</span>
        </div>
        <div className="text-left">
          <div className="display text-display-2 leading-none">{away.team}</div>
          <div className="mt-1 font-mono text-mono-sm text-faint">xG {away.xg.toFixed(2)}</div>
        </div>
      </div>

      <GoalTimeline goals={goals} homeTeam={home.team} />
    </div>
  );
}
