"use client";

import { useState } from "react";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import { modelName, type MatchSummaryComparisonData } from "@/lib/match-summary-comparison";

/** Small pill matching the table's "Chosen · …" tag — same visual language, reused per tab. */
function ChosenTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-sm bg-focal-soft px-1.5 py-0.5 font-mono text-mono-xs tracking-[0.06em] text-focal uppercase">
      {children}
    </span>
  );
}

/**
 * The actual generated text from each of the five comparison runs, one tab per
 * (model, effort) combination — same content shape as MatchSummaryContent's body,
 * plus what a hand check found wrong in that run. Client component: tab state.
 */
export function MatchSummaryRunTabs({ data }: { data: MatchSummaryComparisonData }) {
  const [active, setActive] = useState(String(data.cells[0]?.n ?? ""));
  const cell = data.cells.find((c) => String(c.n) === active) ?? data.cells[0];
  if (!cell) return null;

  const chosenOutcome = data.routing?.outcome === cell.n;
  const chosenTactics = data.routing?.tactics === cell.n;
  const outcome = cell.calls.outcome.output;
  const tacticsParagraphs = (cell.calls.tactics.output ?? "").split("\n\n").filter((p) => p.length > 0);
  const notes = cell.grading.notes ?? [];

  return (
    <div>
      <ToggleGroup
        options={data.cells.map((c) => ({
          value: String(c.n),
          label: `${modelName(c.model)} · ${c.effort ?? "none"}`,
        }))}
        value={active}
        onChange={setActive}
        className="mb-4 flex-wrap"
      />

      {(chosenOutcome || chosenTactics) && (
        <div className="mb-3 flex gap-1.5">
          {chosenOutcome && <ChosenTag>Chosen · Outcome</ChosenTag>}
          {chosenTactics && <ChosenTag>Chosen · Tactics</ChosenTag>}
        </div>
      )}

      {outcome ? (
        <>
          <h4 className="display mb-4 text-display-4 font-semibold text-text">{outcome.headline}</h4>

          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {outcome.key_stats.map((stat) => (
              <div key={stat.label} title={stat.source_field} className="rounded-lg border border-border p-2.5">
                <div className="mb-1 font-mono text-mono-xs tracking-[0.04em] text-faint uppercase">
                  {stat.label}
                </div>
                <div className="text-base font-semibold text-text">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="mb-5">
            <div className="mb-2 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">
              Standout performers
            </div>
            {outcome.standout_performers.map((performer) => (
              <div key={performer.player} title={performer.source_field} className="border-b border-border py-2 last:border-b-0">
                <span className="font-semibold text-text">{performer.player}</span>{" "}
                <span className="font-mono text-mono-sm text-muted">({performer.team})</span>
                <div className="mt-0.5 text-sm text-muted">{performer.reason}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mb-5 text-sm text-muted">This run&apos;s outcome call failed — no output recorded.</p>
      )}

      <div className="mb-5">
        <div className="mb-2 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">Tactics</div>
        {tacticsParagraphs.length > 0 ? (
          tacticsParagraphs.map((paragraph, i) => (
            <p key={i} className="mb-3 text-sm leading-relaxed text-text last:mb-0">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted">This run&apos;s tactics call failed — no output recorded.</p>
        )}
      </div>

      {notes.length > 0 && (
        <details className="border-t border-border pt-2.5">
          <summary className="cursor-pointer font-mono text-mono-base text-text">
            What was wrong in this run
          </summary>
          <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-text">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
