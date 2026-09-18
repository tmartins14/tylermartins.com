import matchSummaryData from "@/data/football/match_summary_3943043.json";
import type { MatchSummaryData } from "@/components/charts/MatchSummaryContent";

/**
 * Shared loader for the one generated match-summary fixture. Both the
 * football dashboard's modal and the /ai/match-summary showcase render the
 * same MatchSummaryContent off this call, so there's a single code path
 * producing the typed data — not a copy-pasted rendering of it.
 */
export function getMatchSummary(): MatchSummaryData {
  return matchSummaryData as MatchSummaryData;
}
