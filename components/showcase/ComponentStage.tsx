"use client";

import { useEffect, useState } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPitch } from "footballd3/pitch";
import { createShotMap } from "footballd3/shotMap";
import { createPassNetwork } from "footballd3/passNetwork";
import { createFreezeFrame } from "footballd3/freezeFrame";
import { createConvexHull } from "footballd3/convexHull";
import { createHeatmap } from "footballd3/heatmap";
import { createComparisonBars } from "footballd3/comparisonBars";
import { createTeamShape } from "footballd3/teamShape";
import { createProgressiveMap } from "footballd3/progressiveMap";
import { createEventScatter } from "footballd3/eventScatter";
import { createTimelineStrip } from "footballd3/timelineStrip";
import { createXtSurface } from "footballd3/xtSurface";
import { createMomentumChart } from "footballd3/momentumChart";
import { createMomentumBarChart } from "footballd3/momentumBarChart";
import { CHART_THEME } from "@/lib/chart-theme";
import { useContainerWidth } from "@/hooks/useContainerWidth";
import { computePxPerYard } from "@/lib/pitch-scale";
import { FormationPanel } from "@/components/charts/FormationPanel";
import { MatchStatsPanel } from "@/components/charts/MatchStatsPanel";
import { PlayAnimationPanel } from "@/components/charts/PlayAnimationPanel";
import type { ComponentEntry } from "@/lib/components";
import type { Shot } from "@/components/charts/ShotMapPanel";
import {
  shotsFor,
  passNetworkFor,
  formationFor,
  teamShapeFor,
  progressiveMapFor,
  freezeFrameGoal,
  convexHullGoal,
  heatmapData,
  comparisonBarsGenericSample,
  possessionData,
  xtGridData,
  goalAnimationData,
  momentumData,
  matchStatsData,
  type Side,
} from "@/lib/componentLibraryData";

const PROGRESSIVE_TOGGLE: Record<string, string> = { pass: "passes", carry: "carries", all: "both" };
const PADDING = 24;
const PITCH_MAX_PX_PER_YARD = 3.2;

type MomentumBin = { start: number; end: number; value: number };

/**
 * Full-size, interactive footballd3 renders for every registry entry except
 * formation, matchStats, and playAnimation, which reuse the dashboard's own
 * panel components unmodified (see ComponentStage below). Every pitch-based
 * case here shares one pxPerYard scale (computed once, off the full pitch's
 * 120-yard axis) and defaults to horizontal orientation, so "1 yard" is the
 * same number of pixels and the container is the same size everywhere.
 */
function FreshStage({
  name,
  side,
  mode,
  orientationMode,
  stage,
}: {
  name: string;
  side: Side;
  mode: string;
  orientationMode: string;
  stage: { w: number; h: number };
}) {
  const { ref: containerRef, width } = useContainerWidth<HTMLDivElement>();
  const { resolvedTheme } = useTheme();
  const [shotHover, setShotHover] = useState<Shot | null>(null);
  const [momHover, setMomHover] = useState<MomentumBin | null>(null);
  const boxW = Math.min(stage.w, width ?? stage.w);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !width) return;

    const theme = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg");
    const pitchTheme = { background: theme.elevated, lines: theme.pitch, lineWeight: 1.1 };
    const color = side === "home" ? theme.focal : theme.secondary;
    // Shared across every pitch-based case below, full or half — same scale everywhere.
    const pxPerYard = computePxPerYard(boxW, 120, PADDING, PITCH_MAX_PX_PER_YARD);

    switch (name) {
      case "pitch": {
        createPitch(svg, { orientation: mode, pxPerYard, padding: PADDING, theme: pitchTheme });
        break;
      }
      case "shotMap": {
        createShotMap(svg, shotsFor(side), {
          orientation: "horizontal",
          pxPerYard,
          theme: pitchTheme,
          color,
          styleMode: "tier",
          showTooltip: false,
          onHover: setShotHover,
        });
        break;
      }
      case "passNetwork": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard,
          padding: PADDING,
          theme: pitchTheme,
        });
        createPassNetwork(pitch, passNetworkFor(side), {
          nodeColor: color,
          edgeColor: color,
          labelColor: theme.text,
          labelPosition: "below",
          nodeRadius: [4, 10],
          edgeWidth: [0.5, 2.5],
          minEdgeCount: 4,
        });
        break;
      }
      case "freezeFrame": {
        const pitch = createPitch(svg, {
          mode: "half",
          orientation: "horizontal",
          pxPerYard,
          padding: PADDING,
          theme: pitchTheme,
        });
        createFreezeFrame(pitch, freezeFrameGoal(), {
          mirrorX: true,
          teamColor: theme.focal,
          opponentColor: theme.secondary,
          markerRadius: 6,
        });
        break;
      }
      case "convexHull": {
        const pitch = createPitch(svg, {
          mode: "half",
          orientation: "horizontal",
          pxPerYard,
          padding: PADDING,
          theme: pitchTheme,
        });
        createFreezeFrame(pitch, freezeFrameGoal(), {
          mirrorX: true,
          teamColor: theme.focal,
          opponentColor: theme.secondary,
          markerRadius: 6,
        });
        createConvexHull(pitch, convexHullGoal(), {
          toggle: mode,
          offenseColor: theme.focal,
          defenseColor: theme.secondary,
          mirrorX: true,
        });
        break;
      }
      case "heatmap": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard,
          padding: PADDING,
          theme: pitchTheme,
        });
        createHeatmap(pitch, heatmapData, {
          colorLow: theme.elevated,
          colorHigh: theme.focal,
          maxOpacity: 0.85,
        });
        break;
      }
      case "comparisonBars": {
        svg.remove();
        createComparisonBars(container$, comparisonBarsGenericSample({ left: theme.focal, right: theme.secondary }), {
          width: boxW,
          rowHeight: 34,
          barHeight: 13,
          labelWidth: 120,
          headerHeight: 28,
          paddingY: 8,
        });
        break;
      }
      case "teamShape": {
        const pitch = createPitch(svg, {
          mode: "full",
          orientation: "horizontal",
          pxPerYard,
          padding: PADDING,
          theme: pitchTheme,
        });
        const view = mode === "out" ? "off-ball" : "on-ball";
        const shape = createTeamShape(pitch, teamShapeFor(side), {
          view,
          nodeColor: color,
          accentColor: color,
          backgroundColor: theme.elevated,
        });
        if (view === "on-ball") {
          const nodes = teamShapeFor(side).on_ball.periods[0]?.nodes ?? [];
          if (nodes.length > 0) {
            const cx = nodes.reduce((a, n) => a + n.x, 0) / nodes.length;
            const cy = nodes.reduce((a, n) => a + n.y, 0) / nodes.length;
            const [px, py] = shape.px(cx, cy);
            shape.g
              .append("line")
              .attr("x1", px - 6).attr("y1", py).attr("x2", px + 6).attr("y2", py)
              .attr("stroke", color).attr("stroke-width", 1.4);
            shape.g
              .append("line")
              .attr("x1", px).attr("y1", py - 6).attr("x2", px).attr("y2", py + 6)
              .attr("stroke", color).attr("stroke-width", 1.4);
          }
        }
        break;
      }
      case "progressiveMap": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard,
          padding: PADDING,
          theme: pitchTheme,
        });
        createProgressiveMap(pitch, progressiveMapFor(side), {
          toggle: PROGRESSIVE_TOGGLE[mode] ?? "both",
        });
        break;
      }
      case "eventScatter": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard,
          padding: PADDING,
          theme: pitchTheme,
        });
        const es = createEventScatter(pitch, possessionData, { markerRadius: 5 });
        if (mode === "pass") es.update({ filter: (e: { event_type: string }) => e.event_type === "Pass" });
        else if (mode === "shot") es.update({ filter: (e: { event_type: string }) => e.event_type === "Shot" });
        break;
      }
      case "timelineStrip": {
        svg.remove();
        createTimelineStrip(container$, possessionData, {
          width: boxW,
          height: stage.h,
          padding: { top: 32, right: 32, bottom: 40, left: 32 },
          glyphRadius: 9,
          stackStep: 22,
        });
        break;
      }
      case "xtSurface": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard,
          padding: PADDING,
          theme: pitchTheme,
        });
        createXtSurface(pitch, xtGridData, { opacity: 0.75 });
        break;
      }
      case "momentumChart": {
        svg.remove();
        const orientation = orientationMode === "vertical" ? "vertical" : "horizontal";
        if (mode === "bars") {
          createMomentumBarChart(container$, momentumData, {
            width: boxW,
            height: stage.h,
            orientation,
            homeColor: theme.focal,
            awayColor: theme.secondary,
            onHover: setMomHover,
          });
        } else {
          createMomentumChart(container$, momentumData, {
            width: boxW,
            height: stage.h,
            orientation,
            homeColor: theme.focal,
            awayColor: theme.secondary,
          });
        }
        break;
      }
    }

    return () => {
      container$.selectAll("*").remove();
    };
  }, [name, side, mode, orientationMode, boxW, width, containerRef, stage.h, resolvedTheme]);

  const goalCount = name === "shotMap" ? shotsFor(side).filter((s) => s.is_goal).length : 0;
  const xgSum = name === "shotMap" ? shotsFor(side).reduce((a, s) => a + s.xg, 0) : 0;
  const shotReadout = shotHover
    ? `${shotHover.display_name} · ${shotHover.minute}' · xG ${shotHover.xg.toFixed(2)} · ${shotHover.outcome}`
    : `${shotsFor(side).length} shots · ${goalCount} goals · xG ${xgSum.toFixed(2)}`;
  const momReadout = momHover
    ? `${momHover.start}'–${momHover.end}' · ${momHover.value >= 0 ? momentumData.home_team : momentumData.away_team} threat ${momHover.value >= 0 ? "+" : ""}${momHover.value.toFixed(2)}`
    : "Hover the chart for a per-window readout";

  return (
    <div className="flex w-full flex-col items-center">
      <div
        ref={containerRef}
        className="flex w-full items-center justify-center"
        style={{ maxWidth: stage.w, minHeight: stage.h }}
      />
      {name === "shotMap" ? (
        <div
          className="mt-2 font-mono text-[11px]"
          style={{ color: shotHover ? `var(--${side === "home" ? "focal" : "secondary"})` : "var(--faint)" }}
        >
          {shotReadout}
        </div>
      ) : null}
      {name === "momentumChart" && mode === "bars" ? (
        <div className="mt-2 font-mono text-[11px] text-faint">{momReadout}</div>
      ) : null}
    </div>
  );
}

export function ComponentStage({
  entry,
  side,
  mode,
  orientationMode,
}: {
  entry: ComponentEntry;
  side: Side;
  mode: string;
  /** Second, independent toggle value — currently only momentumChart's Horizontal/Vertical. */
  orientationMode?: string;
}) {
  const colorToken = side === "home" ? "focal" : "secondary";

  switch (entry.name) {
    case "formation":
      // Plain block wrapper, not flex — FormationPanel measures its own width via
      // useContainerWidth, but as a bare flex child (auto width = shrink-to-content,
      // and there's no content yet on the first measure) it collapses to near-zero.
      // A block-level ancestor with an explicit width gives it something real to
      // read via ordinary block auto-fill sizing.
      return (
        <div style={{ width: "100%", maxWidth: entry.stage.w }}>
          <FormationPanel data={formationFor(side)} colorToken={colorToken} />
        </div>
      );
    case "matchStats":
      return <MatchStatsPanel data={matchStatsData} />;
    case "playAnimation":
      return <PlayAnimationPanel goals={goalAnimationData.goals} />;
    default:
      return (
        <FreshStage
          name={entry.name}
          side={side}
          mode={mode}
          orientationMode={orientationMode ?? entry.defaultOrientationMode ?? "horizontal"}
          stage={entry.stage}
        />
      );
  }
}
