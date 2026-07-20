export type MatchStatsData = {
  home: { team: string; color: string; score: number };
  away: { team: string; color: string; score: number };
  rows: {
    label: string;
    home_value: number;
    away_value: number;
    scale_type: "sum" | "fixed100" | "max";
    format: "int" | "pct" | "float1";
    tier: "basic" | "advanced";
    max_value?: number;
  }[];
  metadata: { match_id: number; competition: string; match_label: string };
};

// The design's curated 8-row list, in order — a display-only selection over the
// real (larger) data set. Left label is the display label; right is the row's
// actual label in match_stats_{match_id}.json.
const ROW_ORDER: [string, string][] = [
  ["Shots", "Shots"],
  ["On target", "Shots on Target"],
  ["xG", "xG"],
  ["Possession", "Possession"],
  ["Passes", "Passes"],
  ["Pass acc.", "Pass acc."],
  ["Corners", "Corners"],
  ["Fouls", "Fouls"],
  ["Yellow", "Yellow Cards"],
  ["Red", "Red Cards"],
];

function formatValue(v: number, format: string): string {
  if (format === "pct") return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}%`;
  if (format === "float1") return v.toFixed(2);
  return String(Math.round(v));
}

export function MatchStatsRows({ data }: { data: MatchStatsData }) {
  const byLabel = new Map(data.rows.map((r) => [r.label, r]));
  const rows = ROW_ORDER.map(([display, sourceLabel]) => ({
    display,
    row: byLabel.get(sourceLabel),
  })).filter((r) => r.row);

  return (
    <div className="flex h-full flex-col justify-evenly">
      {rows.map(({ display, row }) => {
        const r = row!;
        const total = r.home_value + r.away_value || 1;
        const homeShare = (r.home_value / total) * 100;
        const awayShare = (r.away_value / total) * 100;
        return (
          <div
            key={display}
            className="grid items-center gap-[9px] leading-none"
            style={{ gridTemplateColumns: "44px 1fr 88px 1fr 44px" }}
          >
            <span className="text-right font-mono text-[12.5px] leading-none text-focal">
              {formatValue(r.home_value, r.format)}
            </span>
            <div className="flex justify-end">
              <div
                className="h-2 rounded-[4px] bg-focal"
                style={{ width: `${homeShare}%` }}
              />
            </div>
            <span className="text-center font-mono text-[10px] leading-none tracking-[0.05em] text-faint uppercase">
              {display}
            </span>
            <div className="flex justify-start">
              <div
                className="h-2 rounded-[4px] bg-secondary"
                style={{ width: `${awayShare}%` }}
              />
            </div>
            <span className="font-mono text-[12.5px] leading-none text-secondary">
              {formatValue(r.away_value, r.format)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
