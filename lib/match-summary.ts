import matchSummaryData from "@/data/football/match_summary_3943043.json";
import matchSummaryComparisonData from "@/data/football/match_summary_comparison_3943043.json";
import type { MatchSummaryData } from "@/components/charts/MatchSummaryContent";
import type { MatchSummaryComparisonData } from "@/lib/match-summary-comparison";

/**
 * Shared loader for the one generated match-summary fixture. Both the
 * football dashboard's modal and the /ai/match-summary showcase render the
 * same MatchSummaryContent off this call, so there's a single code path
 * producing the typed data — not a copy-pasted rendering of it.
 */
export function getMatchSummary(): MatchSummaryData {
  return matchSummaryData as MatchSummaryData;
}

/**
 * The five-run model × effort comparison behind the summary's routing. A slim copy
 * of football-analytics' output/3943043/comparison-3943043.json (drops the full
 * usage breakdown, keeps each run's generated output), written by
 * `compare_models --export-site` — a manual copy, like the summary JSON.
 */
export function getMatchSummaryComparison(): MatchSummaryComparisonData {
  return matchSummaryComparisonData as MatchSummaryComparisonData;
}
