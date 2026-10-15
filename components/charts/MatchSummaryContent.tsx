export type MatchSummaryData = {
  outcome: {
    headline: string;
    key_stats: { label: string; value: string; source_field: string }[];
    standout_performers: { player: string; team: string; reason: string; source_field: string }[];
  };
  tactics: { prose: string };
  metadata: {
    match_id: number;
    home_team: string;
    away_team: string;
    competition: string;
    match_label: string;
    models: { outcome: string; tactics: string };
    effort: { outcome: string; tactics: string };
  };
};

// Disclaimer text is hardcoded to match 3943043's current hand-check result,
// found by the manual trace in football-analytics'
// ai/match_summary/VERIFICATION-3943043-v2.md (DATA-SPEC-v2 Part 5, 2026-10-14).
// The tactics section now runs on a deterministic findings layer (Parts 0-4)
// instead of free prose, and the two errors this list used to carry — the
// headline's outside-knowledge claim, the Saka/Kane on-ball mix-up — don't
// appear in this text. If this component is ever reused for a different
// match's match_summary.json, or the JSON is regenerated again, this list
// must be revisited — it is not a generic "AI-generated, may contain
// errors" notice, and is only accurate for the exact text currently in
// match_summary_3943043.json.
const DISCLAIMER_ISSUES: string[] = [];

/** Section eyebrow label — matches ComponentModal.tsx's sidebar section-label convention. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">
      {children}
    </div>
  );
}

export function MatchSummaryContent({ data }: { data: MatchSummaryData }) {
  const paragraphs = data.tactics.prose.split("\n\n").filter((p) => p.length > 0);

  return (
    <div>
      <div className="mb-6 rounded-lg border border-focal border-l-4 bg-focal-soft p-4 text-sm leading-relaxed break-words text-text">
        <div className="mb-2 font-mono text-mono-sm font-semibold tracking-[0.04em] text-focal uppercase">
          ℹ AI-generated summary — re-verified, no known issues
        </div>
        <p className="mb-2.5">
          The tactics section is generated from a deterministic findings layer — every
          number, label, and comparison is computed in code and stated word for word, not
          written freely by the model. Generated three times against the live API and
          hand-checked once; all three passed the grounding check and none of the eight
          previously known defects recurred.
        </p>
        {DISCLAIMER_ISSUES.length > 0 ? (
          <ul className="mb-2.5 list-disc space-y-1.5 pl-5">
            {DISCLAIMER_ISSUES.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : null}
        <p className="text-muted">
          This was a hand check of one run, not an exhaustive claim-by-claim trace, and no
          automated evaluation exists yet for this feature — that&apos;s Module 3 of the
          curriculum, not built here. Full trace: ai/match_summary/VERIFICATION-3943043-v2.md.
        </p>
      </div>

      <h2 className="display mb-5 text-display-4 font-semibold text-text">{data.outcome.headline}</h2>

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {data.outcome.key_stats.map((stat) => (
          <div
            key={stat.label}
            title={stat.source_field}
            className="rounded-lg border border-border p-2.5"
          >
            <div className="mb-1 font-mono text-mono-xs tracking-[0.04em] text-faint uppercase">
              {stat.label}
            </div>
            <div className="text-base font-semibold text-text">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <SectionLabel>Standout performers</SectionLabel>
        {data.outcome.standout_performers.map((performer) => (
          <div
            key={performer.player}
            title={performer.source_field}
            className="border-b border-border py-2 last:border-b-0"
          >
            <span className="font-semibold text-text">{performer.player}</span>{" "}
            <span className="font-mono text-mono-sm text-muted">({performer.team})</span>
            <div className="mt-0.5 text-sm text-muted">{performer.reason}</div>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <SectionLabel>Tactics</SectionLabel>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="mb-3 text-sm leading-relaxed text-text last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="font-mono text-mono-xs text-faint">
        {data.metadata.match_label} · {data.metadata.competition} · outcome:{" "}
        {data.metadata.models.outcome} ({data.metadata.effort.outcome}) · tactics:{" "}
        {data.metadata.models.tactics} ({data.metadata.effort.tactics})
      </div>
    </div>
  );
}
