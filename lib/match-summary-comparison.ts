/**
 * Types and helpers shared by MatchSummaryComparison (the results table) and
 * MatchSummaryRunTabs (the per-run showcase) — kept in a plain module, not a
 * component file, so the two don't import from each other.
 */

export type ComparisonOutcomeOutput = {
  headline: string;
  key_stats: { label: string; value: string; source_field: string }[];
  standout_performers: { player: string; team: string; reason: string; source_field: string }[];
};

export type ComparisonCall<TOutput> = {
  section: string;
  latency_s: number;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  output: TOutput | null;
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
  calls: {
    outcome: ComparisonCall<ComparisonOutcomeOutput>;
    tactics: ComparisonCall<string>;
  };
  grading: {
    outcome_grounding: string | null;
    motm: string | null;
    tactics_grounding: string | null;
    notes?: string[];
  };
};

/** Slim copy of football-analytics' comparison-3943043.json — drops the full usage
 * breakdown, keeps each call's generated output for a run-by-run showcase. */
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

/** Short display name for a model ID — falls back to the raw ID for an unmapped model. */
export const modelName = (id: string) => MODEL_NAMES[id] ?? id;
