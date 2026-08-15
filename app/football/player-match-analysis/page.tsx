import type { Metadata } from "next";
import formationSpainData from "@/data/football/formation_3943043_spain.json";
import formationEnglandData from "@/data/football/formation_3943043_england.json";
import substitutesData from "@/data/football/substitutes_3943043.json";
import possessionSharesData from "@/data/football/possession_shares_3943043.json";
import { PlayerMatchAnalysisClient } from "@/components/charts/PlayerMatchAnalysisClient";
import { StatsBombAttribution } from "@/components/StatsBombAttribution";
import type { FormationData, BenchPlayer } from "@/components/charts/FormationPanel";
import type { PossessionShares } from "@/components/charts/PlayerStatCardsPanel";
import { metadata as contentMetadata } from "./content.mdx";

export const metadata: Metadata = {
  title: contentMetadata.title,
  description: contentMetadata.description,
};

// Real, fixed facts about this specific historical match (not part of any
// current extraction contract) — matches the convention already used on
// /football/dashboard. Euro 2024 Final: Spain 2-1 England, Olympiastadion
// Berlin, 14 Jul 2024.
const MATCH_ID = 3943043;
const COMPETITION = "UEFA Euro 2024 Final";
const VENUE = "Olympiastadion, Berlin";
const MATCH_DATE = "14 Jul 2024";
const HOME_SCORE = 2;
const AWAY_SCORE = 1;

export default function PlayerMatchAnalysisPage() {
  return (
    <div className="px-4 py-4 dash:px-9 dash:py-10">
      <div className="mx-auto max-w-pma">
        <PlayerMatchAnalysisClient
          formationByTeam={{
            Spain: formationSpainData as FormationData,
            England: formationEnglandData as FormationData,
          }}
          benchByTeam={{
            Spain: substitutesData.teams.Spain as BenchPlayer[],
            England: substitutesData.teams.England as BenchPlayer[],
          }}
          possessionShares={possessionSharesData as PossessionShares}
          competition={COMPETITION}
          matchId={MATCH_ID}
          venue={VENUE}
          matchDate={MATCH_DATE}
          homeScore={HOME_SCORE}
          awayScore={AWAY_SCORE}
        />

        <div className="mt-5">
          <StatsBombAttribution variant="row" size={16} rightNote={`${COMPETITION} · match ${MATCH_ID}`} />
        </div>
      </div>
    </div>
  );
}
