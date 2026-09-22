"use client";

import { useState } from "react";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import type { MatchSummaryData } from "@/components/charts/MatchSummaryContent";
import { modelName, type MatchSummaryComparisonData } from "@/lib/match-summary-comparison";

// The shipped default mixes routing — outcome and tactics come from different
// (model, effort) configs — so it isn't literally one of the five uniform
// comparison cells. Its issue list is a hand-maintained duplicate of
// MatchSummaryContent.tsx's DISCLAIMER_ISSUES (same two facts, phrased to match
// the "Outcome:"/"Tactics:" bullet style the comparison cells use below). If the
// shipped text is ever regenerated, update both lists together.
const SHIPPED_ISSUES = [
  "Outcome: all 7 key_stats match the source data.",
  "Outcome error: the headline's \"sweep of the group's heavyweights\" isn't in the source data — outside knowledge the model was told not to use.",
  "Tactics error: the tactics prose calls Saka England's highest-positioned player, citing on-ball coordinates (75.5). Kane's on-ball position (77.7) is further forward; the claim only holds for Saka's pass-network position (82.6).",
];

const usd = (value: number | null | undefined) => (value == null ? "—" : `$${value.toFixed(2)}`);
const seconds = (value: number | null | undefined) => (value == null ? "—" : `${Math.round(value)}s`);

type ComponentRouting = { model: string; effort: string | null; costUsd: number | null; latencyS: number | null };

type Run = {
  id: string;
  tabLabel: string;
  outcomeRouting: ComponentRouting;
  tacticsRouting: ComponentRouting;
  headline: string;
  keyStats: { label: string; value: string; source_field: string }[];
  performers: { player: string; team: string; reason: string; source_field: string }[];
  tacticsProse: string;
  issues: string[];
  costNote?: string;
};

/**
 * Six runs to show: the shipped default (mixed routing, matches the dashboard
 * modal) plus the five uniform comparison cells. Pure — no I/O — so the tab
 * switch itself never refetches anything.
 */
function buildRuns(summary: MatchSummaryData, comparison: MatchSummaryComparisonData): Run[] {
  const outcomeCell = comparison.cells.find((c) => c.n === comparison.routing?.outcome);
  const tacticsCell = comparison.cells.find((c) => c.n === comparison.routing?.tactics);

  const shipped: Run = {
    id: "shipped",
    tabLabel: "Shipped",
    outcomeRouting: {
      model: summary.metadata.models.outcome,
      effort: summary.metadata.effort.outcome,
      costUsd: outcomeCell?.calls.outcome.cost_usd ?? null,
      latencyS: outcomeCell?.calls.outcome.latency_s ?? null,
    },
    tacticsRouting: {
      model: summary.metadata.models.tactics,
      effort: summary.metadata.effort.tactics,
      costUsd: tacticsCell?.calls.tactics.cost_usd ?? null,
      latencyS: tacticsCell?.calls.tactics.latency_s ?? null,
    },
    headline: summary.outcome.headline,
    keyStats: summary.outcome.key_stats,
    performers: summary.outcome.standout_performers,
    tacticsProse: summary.tactics.prose,
    issues: SHIPPED_ISSUES,
    costNote:
      "This exact generation's usage wasn't recorded separately — cost and time above reuse the comparison run at the same model and effort. Effort output isn't deterministic, so treat them as representative, not exact.",
  };

  const cellRuns: Run[] = comparison.cells.map((cell) => ({
    id: String(cell.n),
    tabLabel: `${modelName(cell.model)} · ${cell.effort ?? "none"}`,
    outcomeRouting: {
      model: cell.model,
      effort: cell.effort,
      costUsd: cell.calls.outcome.cost_usd,
      latencyS: cell.calls.outcome.latency_s,
    },
    tacticsRouting: {
      model: cell.model,
      effort: cell.effort,
      costUsd: cell.calls.tactics.cost_usd,
      latencyS: cell.calls.tactics.latency_s,
    },
    headline: cell.calls.outcome.output?.headline ?? "",
    keyStats: cell.calls.outcome.output?.key_stats ?? [],
    performers: cell.calls.outcome.output?.standout_performers ?? [],
    tacticsProse: cell.calls.tactics.output ?? "",
    issues: cell.grading.notes ?? [],
  }));

  return [shipped, ...cellRuns];
}

/** One component's (outcome or tactics) model, effort, cost, and time. */
function RoutingLine({ label, routing }: { label: string; routing: ComponentRouting }) {
  return (
    <div>
      <span className="font-mono text-mono-xs tracking-[0.06em] text-faint uppercase">{label}</span>{" "}
      <span className="font-mono text-mono-sm text-text">
        {modelName(routing.model)} · {routing.effort ?? "no effort setting"}
      </span>{" "}
      <span className="font-mono text-mono-xs text-muted">
        {usd(routing.costUsd)} · {seconds(routing.latencyS)}
      </span>
    </div>
  );
}

/**
 * The main match summary, tabbable across the shipped default and the five
 * comparison runs. Each tab shows that run's actual generated text, which
 * (model, effort) produced each component, its cost/time, and what a hand
 * check found wrong in it. Client component: tab state.
 */
export function MatchSummaryTabs({
  summary,
  comparison,
}: {
  summary: MatchSummaryData;
  comparison: MatchSummaryComparisonData;
}) {
  const runs = buildRuns(summary, comparison);
  const [active, setActive] = useState(runs[0].id);
  const run = runs.find((r) => r.id === active) ?? runs[0];
  const paragraphs = run.tacticsProse.split("\n\n").filter((p) => p.length > 0);
  const totalCost =
    run.outcomeRouting.costUsd != null && run.tacticsRouting.costUsd != null
      ? run.outcomeRouting.costUsd + run.tacticsRouting.costUsd
      : null;

  return (
    <div>
      <ToggleGroup
        options={runs.map((r) => ({ value: r.id, label: r.tabLabel }))}
        value={active}
        onChange={setActive}
        className="mb-4 flex-wrap"
      />

      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-border p-3">
        <RoutingLine label="Outcome" routing={run.outcomeRouting} />
        <RoutingLine label="Tactics" routing={run.tacticsRouting} />
        <div className="ml-auto font-mono text-mono-sm text-text">
          Total <span className="font-semibold">{usd(totalCost)}</span>
        </div>
      </div>
      {run.costNote && <p className="mb-5 font-mono text-mono-xs text-faint">{run.costNote}</p>}

      <h2 className="display mb-5 text-display-4 font-semibold text-text">{run.headline}</h2>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {run.keyStats.map((stat) => (
          <div key={stat.label} title={stat.source_field} className="rounded-lg border border-border p-2.5">
            <div className="mb-1 font-mono text-mono-xs tracking-[0.04em] text-faint uppercase">{stat.label}</div>
            <div className="text-base font-semibold text-text">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="mb-2 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">Standout performers</div>
        {run.performers.map((performer) => (
          <div key={performer.player} title={performer.source_field} className="border-b border-border py-2 last:border-b-0">
            <span className="font-semibold text-text">{performer.player}</span>{" "}
            <span className="font-mono text-mono-sm text-muted">({performer.team})</span>
            <div className="mt-0.5 text-sm text-muted">{performer.reason}</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="mb-2 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">Tactics</div>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="mb-3 text-sm leading-relaxed text-text last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="rounded-lg border border-focal border-l-4 bg-focal-soft p-4 text-sm leading-relaxed break-words text-text">
        <div className="mb-2 font-mono text-mono-sm font-semibold tracking-[0.04em] text-focal uppercase">
          ⚠ Known issues in this run
        </div>
        {run.issues.length > 0 ? (
          <ul className="list-disc space-y-1.5 pl-5">
            {run.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No issues flagged in the hand check for this run.</p>
        )}
      </div>
    </div>
  );
}
