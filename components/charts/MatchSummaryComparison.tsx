export type ComparisonCall = {
  section: string;
  latency_s: number;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
};

export type ComparisonCell = {
  n: number;
  model: string;
  effort: string | null;
  status: string;
  totals: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    total_usd: number;
    latency_s: number;
  } | null;
  calls: { outcome: ComparisonCall; tactics: ComparisonCall };
  grading: {
    outcome_grounding: string | null;
    motm: string | null;
    tactics_grounding: string | null;
    notes?: string[];
  };
};

/** Slim copy of football-analytics' comparison-3943043.json (no raw model outputs). */
export type MatchSummaryComparisonData = {
  match_id: number;
  created: string;
  spent_usd: number;
  routing: { outcome: number; tactics: number } | null;
  motm: { player: string; note: string } | null;
  cells: ComparisonCell[];
};

const MODEL_NAMES: Record<string, string> = {
  "claude-haiku-4-5": "Haiku 4.5",
  "claude-sonnet-5": "Sonnet 5",
  "claude-opus-5": "Opus 5",
};

const modelName = (id: string) => MODEL_NAMES[id] ?? id;
const usd = (value: number | null | undefined) => (value == null ? "—" : `$${value.toFixed(2)}`);
const seconds = (value: number | null | undefined) => (value == null ? "—" : `${Math.round(value)}s`);
const count = (value: number | null | undefined) => (value == null ? "—" : value.toLocaleString("en-US"));

/** Column header cell — matches the mono-eyebrow convention used elsewhere on the page. */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-3 py-2 text-left font-mono text-mono-sm font-normal tracking-[0.06em] whitespace-nowrap text-faint uppercase"
    >
      {children}
    </th>
  );
}

/** A value with a second, muted line — used for the per-section split under a total. */
function Split({ main, sub }: { main: string; sub: string }) {
  return (
    <>
      <div className="font-semibold text-text">{main}</div>
      <div className="font-mono text-mono-xs text-faint">{sub}</div>
    </>
  );
}

/**
 * All five model × effort runs on one match: cost, time, tokens, and the errors a
 * hand check found in each. Server component — the data is a static JSON file.
 */
export function MatchSummaryComparison({ data }: { data: MatchSummaryComparisonData }) {
  const motmHeading = data.motm ? `MOTM (${data.motm.player})` : "MOTM";

  return (
    <section id="comparison" className="mb-8">
      <h2 className="mb-2.5 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">
        Model &amp; effort comparison
      </h2>
      <p className="mb-4 max-w-[82ch] text-base leading-[1.6] text-text">
        Five runs of the same match, built on StatsBomb open data, each one an outcome call plus
        a tactics call. Cost and tokens come from the API&apos;s own usage numbers, not
        estimates. Errors are called out by hand rather than scored: there&apos;s no automated
        evaluation yet, so a wrong claim is recorded, not disqualifying. One run per
        combination, and output varies between runs, so small gaps are noise.
      </p>

      <div
        role="region"
        aria-label="Comparison of five model and effort runs"
        tabIndex={0}
        className="mb-4 overflow-x-auto rounded-lg border border-border"
      >
        <table className="w-full min-w-max border-collapse text-sm">
          <thead className="border-b border-border">
            <tr>
              <Th>Model</Th>
              <Th>Effort</Th>
              <Th>Cost</Th>
              <Th>Time</Th>
              <Th>Tokens in / out</Th>
              <Th>Outcome errors</Th>
              <Th>Tactics errors</Th>
              <Th>{motmHeading}</Th>
            </tr>
          </thead>
          <tbody>
            {data.cells.map((cell) => {
              const chosen = [
                data.routing?.outcome === cell.n ? "Outcome" : null,
                data.routing?.tactics === cell.n ? "Tactics" : null,
              ].filter(Boolean);
              return (
                <tr key={cell.n} className="border-b border-border align-top last:border-b-0">
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-text">{modelName(cell.model)}</div>
                    {chosen.length > 0 && (
                      <span className="mt-1 inline-block rounded-sm bg-focal-soft px-1.5 py-0.5 font-mono text-mono-xs tracking-[0.06em] text-focal uppercase">
                        Chosen · {chosen.join(" + ")}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-mono-base text-muted">{cell.effort ?? "none"}</td>
                  <td className="px-3 py-2.5 tabular-nums">
                    <Split
                      main={usd(cell.totals?.total_usd)}
                      sub={`outcome ${usd(cell.calls.outcome.cost_usd)} · tactics ${usd(cell.calls.tactics.cost_usd)}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    <Split
                      main={seconds(cell.totals?.latency_s)}
                      sub={`outcome ${seconds(cell.calls.outcome.latency_s)} · tactics ${seconds(cell.calls.tactics.latency_s)}`}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-mono text-mono-base whitespace-nowrap text-muted tabular-nums">
                    {count(cell.totals?.input_tokens)} / {count(cell.totals?.output_tokens)}
                  </td>
                  <td className="px-3 py-2.5 text-text">{cell.grading.outcome_grounding ?? "—"}</td>
                  <td className="px-3 py-2.5 text-text">{cell.grading.tactics_grounding ?? "—"}</td>
                  <td className="px-3 py-2.5 text-text">{cell.grading.motm ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        {data.cells.map((cell) => (
          <details key={cell.n} className="border-b border-border py-2.5 first:border-t">
            <summary className="cursor-pointer font-mono text-mono-base text-text">
              {modelName(cell.model)} · {cell.effort ?? "no effort setting"} — what was wrong
            </summary>
            <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-text">
              {(cell.grading.notes ?? []).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      {data.motm && (
        <p className="mb-2.5 max-w-[82ch] text-sm leading-relaxed text-muted">
          <span className="font-semibold text-text">{motmHeading}:</span> {data.motm.note}
        </p>
      )}
      <p className="max-w-[82ch] font-mono text-mono-sm text-faint">
        Cost is each call&apos;s token usage at list prices as of {data.created}; time is
        wall-clock for both calls; the &quot;chosen&quot; tags are the current default, to
        revisit once there&apos;s an automated evaluation. Full record, with each run&apos;s raw
        output: ai/match_summary/output/{data.match_id}/comparison-{data.match_id}.json.
      </p>
    </section>
  );
}
