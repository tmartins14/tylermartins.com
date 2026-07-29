import matchStatsJson from "@/data/football/match_stats_3943043.json";
import shotsJson from "@/data/football/shots_3943043.json";
import momentumJson from "@/data/football/momentum_3943043.json";
import passNetworkSpainJson from "@/data/football/pass_network_3943043_Spain.json";
import passNetworkEnglandJson from "@/data/football/pass_network_3943043_England.json";
import formationSpainJson from "@/data/football/formation_3943043_spain.json";
import formationEnglandJson from "@/data/football/formation_3943043_england.json";
import teamShapeSpainJson from "@/data/football/team_shape_3943043_spain.json";
import teamShapeEnglandJson from "@/data/football/team_shape_3943043_england.json";
import goalAnimationJson from "@/data/football/goal_animation_3943043.json";
import convexHullJson from "@/data/football/convex_hull_3943043_goals.json";
import freezeFramesJson from "@/data/football/freeze_frames_3943043_goals.json";
import progressiveMapSpainJson from "@/data/football/progressive_map_3943043_spain.json";
import progressiveMapEnglandJson from "@/data/football/progressive_map_3943043_england.json";
import xtGridJson from "@/data/football/xt_grid.json";
import possessionJson from "@/data/football/possession_3943043_60.json";
import heatmapJson from "@/data/football/heatmap_3943043_lamine_yamal_nasraoui_ebana.json";

import type { Shot } from "@/components/charts/ShotMapPanel";
import type { PassNetworkData } from "@/components/charts/PassNetworkPanel";
import type { FormationData } from "@/components/charts/FormationPanel";
import type { TeamShapeData } from "@/components/charts/TeamShapePanel";
import type { MatchStatsData } from "@/components/charts/MatchStatsRows";
import type { MomentumData } from "@/components/charts/MomentumChartPanel";
import type { GoalClip } from "@/components/charts/PlayAnimationPanel";

export type Side = "home" | "away";

export const matchStatsData = matchStatsJson as MatchStatsData;
export const momentumData = momentumJson as unknown as MomentumData;
export const goalAnimationData = goalAnimationJson as { goals: GoalClip[] };
export const convexHullData = convexHullJson;
export const freezeFramesData = freezeFramesJson;
export const xtGridData = xtGridJson;
export const possessionData = possessionJson;
export const heatmapData = heatmapJson;

const shotsData = shotsJson as Shot[];

/** { home, away } team names, resolved once from the real match data. */
export const TEAM_NAME: Record<Side, string> = {
  home: matchStatsData.home.team,
  away: matchStatsData.away.team,
};

export function shotsFor(side: Side): Shot[] {
  return shotsData.filter((s) => s.team === TEAM_NAME[side]);
}

export function passNetworkFor(side: Side): PassNetworkData {
  return (side === "home" ? passNetworkSpainJson : passNetworkEnglandJson) as PassNetworkData;
}

export function formationFor(side: Side): FormationData {
  return (side === "home" ? formationSpainJson : formationEnglandJson) as FormationData;
}

export function teamShapeFor(side: Side): TeamShapeData {
  return (side === "home" ? teamShapeSpainJson : teamShapeEnglandJson) as TeamShapeData;
}

export function progressiveMapFor(side: Side) {
  return side === "home" ? progressiveMapSpainJson : progressiveMapEnglandJson;
}

/** First goal of three — the freezeFrame/convexHull stage always inspects the same instant. */
export function freezeFrameGoal() {
  return freezeFramesData.goals[0];
}

export function convexHullGoal() {
  return convexHullData.hulls[0];
}

/**
 * comparisonBars is the generic, football-agnostic chart matchStats wraps —
 * illustrative sample rows here (not derived from the real match data) so the
 * two components read as clearly distinct in the gallery.
 */
export function comparisonBarsGenericSample(colors: { left: string; right: string }) {
  return {
    left: { label: "Team A", color: colors.left },
    right: { label: "Team B", color: colors.right },
    rows: [
      { label: "Possession", leftValue: 58, rightValue: 42, scaleType: "fixed100" as const, format: "pct" as const },
      { label: "Shots", leftValue: 14, rightValue: 9, scaleType: "sum" as const, format: "int" as const },
      {
        label: "Pass rating",
        leftValue: 4.2,
        rightValue: 3.6,
        scaleType: "max" as const,
        format: "float1" as const,
        maxValue: 5,
      },
      { label: "Duels won", leftValue: 27, rightValue: 21, scaleType: "sum" as const, format: "int" as const },
    ],
  };
}

/**
 * First 3-4 rows feeding a given registry component, for the modal's "Sample data" peek.
 * Team-aware components resolve against the active `side`; the rest ignore it.
 */
export function getSampleRows(name: string, side: Side): unknown[] {
  switch (name) {
    case "shotMap":
      return shotsFor(side).slice(0, 4);
    case "passNetwork":
      return passNetworkFor(side).windows[0]?.nodes.slice(0, 4) ?? [];
    case "formation":
      return formationFor(side).periods[0]?.players.slice(0, 4) ?? [];
    case "teamShape":
      return teamShapeFor(side).on_ball.periods[0]?.nodes.slice(0, 4) ?? [];
    case "progressiveMap":
      return progressiveMapFor(side).actions.slice(0, 4);
    case "freezeFrame":
      return freezeFrameGoal().frame.slice(0, 4);
    case "convexHull":
      return convexHullGoal().sides;
    case "heatmap":
      return heatmapData.grid.values.slice(0, 4);
    case "matchStats":
      return matchStatsData.rows.slice(0, 4);
    case "comparisonBars":
      return comparisonBarsGenericSample({ left: "", right: "" }).rows;
    case "eventScatter":
    case "timelineStrip":
      return possessionData.events.slice(0, 4);
    case "xtSurface":
      return xtGridData.values.slice(0, 4);
    case "playAnimation":
      return goalAnimationData.goals[0]?.frames.slice(0, 4) ?? [];
    case "momentumChart":
      return momentumData.minutes.slice(0, 4);
    default:
      return [];
  }
}
