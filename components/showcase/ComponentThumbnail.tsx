"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useTheme } from "next-themes";
import { createPitch } from "footballd3/pitch";
import { createShotMap } from "footballd3/shotMap";
import { createPassNetwork } from "footballd3/passNetwork";
import { createFreezeFrame } from "footballd3/freezeFrame";
import { createConvexHull } from "footballd3/convexHull";
import { createHeatmap } from "footballd3/heatmap";
import { createMatchStats } from "footballd3/matchStats";
import { createComparisonBars } from "footballd3/comparisonBars";
import { createFormation } from "footballd3/formation";
import { createTeamShape } from "footballd3/teamShape";
import { createProgressiveMap } from "footballd3/progressiveMap";
import { createEventScatter } from "footballd3/eventScatter";
import { createTimelineStrip } from "footballd3/timelineStrip";
import { createXtSurface } from "footballd3/xtSurface";
import { createPlayAnimation } from "footballd3/playAnimation";
import { createMomentumChart } from "footballd3/momentumChart";
import { CHART_THEME } from "@/lib/chart-theme";
import {
  shotsFor,
  passNetworkFor,
  formationFor,
  teamShapeFor,
  progressiveMapFor,
  freezeFrameGoal,
  convexHullGoal,
  heatmapData,
  matchStatsData,
  comparisonBarsGenericSample,
  possessionData,
  xtGridData,
  goalAnimationData,
  momentumData,
  type Side,
} from "@/lib/componentLibraryData";

const W = 132;
const H = 74;
const PAD = 3;

/** Largest pxPerYard that fits a given yard-space axis box inside the 132×74 tile. */
function fit(axisW: number, axisH: number, max = 2.4) {
  return Math.max(0.2, Math.min(max, (W - PAD * 2) / axisW, (H - PAD * 2) / axisH));
}

/**
 * Standalone (non-pitch) components render their own real-size SVG with fixed
 * font sizes — cramming their width/height config down to 132×74 just clips
 * and overlaps the labels. Instead, mount at a legible natural size and scale
 * the whole SVG down uniformly, like a thumbnail preview.
 */
function scaleToFit(container: HTMLElement) {
  const svgEl = container.querySelector("svg");
  if (!svgEl) return;
  const bbox = svgEl.getBoundingClientRect();
  if (bbox.width === 0 || bbox.height === 0) return;
  const scale = Math.min(W / bbox.width, H / bbox.height) * 0.95;
  (svgEl as SVGSVGElement).style.transformOrigin = "center center";
  (svgEl as SVGSVGElement).style.transform = `scale(${scale})`;
}

/**
 * Real footballd3 renders at thumbnail scale — no chrome, no labels, no
 * interaction. Mirrors ComponentStage's mount calls at a smaller pxPerYard.
 * Follows the site's light/dark toggle, same as every other chart on the site.
 */
export function ComponentThumbnail({ name, side }: { name: string; side: Side }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const T = CHART_THEME[resolvedTheme === "dark" ? "dark" : "light"];
    const container$ = d3.select(container);
    container$.selectAll("*").remove();
    const svg = container$.append("svg").attr("width", W).attr("height", H);

    const pitchTheme = { background: "transparent", lines: T.pitch, lineWeight: 0.6 };
    const color = side === "home" ? T.focal : T.secondary;

    switch (name) {
      case "pitch": {
        createPitch(svg, {
          orientation: "horizontal",
          pxPerYard: fit(120, 80),
          padding: PAD,
          theme: pitchTheme,
          showGoals: false,
        });
        break;
      }
      case "shotMap": {
        createShotMap(svg, shotsFor(side), {
          orientation: "horizontal",
          pxPerYard: fit(60, 80),
          theme: pitchTheme,
          color,
          styleMode: "tier",
          shotScale: 0.7,
          showTooltip: false,
        });
        break;
      }
      case "passNetwork": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard: fit(120, 80),
          padding: PAD,
          theme: pitchTheme,
          showGoals: false,
        });
        createPassNetwork(pitch, passNetworkFor(side), {
          nodeColor: color,
          edgeColor: color,
          labelColor: "transparent",
          nodeRadius: [1.5, 5],
          edgeWidth: [0.4, 1.6],
          // Higher than the modal stage's threshold — only the strongest
          // connections draw, keeping the tiny tile from turning into a mess
          // of overlapping lines.
          minEdgeCount: 8,
        });
        break;
      }
      case "freezeFrame": {
        const pitch = createPitch(svg, {
          mode: "half",
          orientation: "horizontal",
          pxPerYard: fit(60, 80),
          padding: PAD,
          theme: pitchTheme,
        });
        createFreezeFrame(pitch, freezeFrameGoal(), {
          mirrorX: true,
          teamColor: T.focal,
          opponentColor: T.secondary,
          markerRadius: 2.5,
          ballRadius: 1.5,
        });
        break;
      }
      case "convexHull": {
        const pitch = createPitch(svg, {
          mode: "half",
          orientation: "horizontal",
          pxPerYard: fit(60, 80),
          padding: PAD,
          theme: pitchTheme,
        });
        createFreezeFrame(pitch, freezeFrameGoal(), {
          mirrorX: true,
          markerRadius: 2,
          ballRadius: 1.3,
          teamColor: T.focal,
          opponentColor: T.secondary,
        });
        createConvexHull(pitch, convexHullGoal(), {
          toggle: "both",
          offenseColor: T.focal,
          defenseColor: T.secondary,
          strokeWidth: 1,
          mirrorX: true,
        });
        break;
      }
      case "heatmap": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard: fit(120, 80),
          padding: PAD,
          theme: pitchTheme,
          showGoals: false,
        });
        createHeatmap(pitch, heatmapData, {
          colorLow: "transparent",
          colorHigh: T.focal,
          maxOpacity: 0.9,
        });
        break;
      }
      case "matchStats": {
        svg.remove();
        createMatchStats(
          container$,
          {
            ...matchStatsData,
            home: { ...matchStatsData.home, color: T.focal },
            away: { ...matchStatsData.away, color: T.secondary },
          },
          {
            showHeader: false,
            showTierToggle: false,
            tier: "basic",
            width: 260,
            rowHeight: 22,
            barHeight: 9,
            labelWidth: 60,
            headerHeight: 0,
            paddingY: 4,
          }
        );
        scaleToFit(container);
        break;
      }
      case "comparisonBars": {
        svg.remove();
        createComparisonBars(container$, comparisonBarsGenericSample({ left: T.focal, right: T.secondary }), {
          width: 260,
          rowHeight: 22,
          barHeight: 9,
          labelWidth: 60,
          headerHeight: 0,
          paddingY: 4,
          showHeader: false,
        });
        scaleToFit(container);
        break;
      }
      case "formation": {
        // formation.js hardcodes vertical orientation internally (not
        // configurable) — this one stays vertical regardless of the theme's
        // otherwise-uniform horizontal default.
        createFormation(svg, formationFor(side), {
          pxPerYard: fit(80, 120, 0.7),
          padding: PAD,
          theme: pitchTheme,
          nodeColor: color,
          labelColor: "transparent",
          backgroundColor: "transparent",
          nodeRadius: 3,
        });
        break;
      }
      case "teamShape": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard: fit(120, 80),
          padding: PAD,
          theme: pitchTheme,
          showGoals: false,
        });
        createTeamShape(pitch, teamShapeFor(side), {
          view: "on-ball",
          nodeColor: color,
          accentColor: color,
          backgroundColor: "transparent",
        });
        break;
      }
      case "progressiveMap": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard: fit(120, 80),
          padding: PAD,
          theme: pitchTheme,
          showGoals: false,
        });
        // progressiveOnly hides the muted non-progressive background layer —
        // full "both" view is ~300+ overlapping arrows, too dense for the tile.
        createProgressiveMap(pitch, progressiveMapFor(side), { toggle: "both", progressiveOnly: true });
        break;
      }
      case "eventScatter": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard: fit(120, 80),
          padding: PAD,
          theme: pitchTheme,
          showGoals: false,
        });
        // First dozen events only — the full possession is legible full-size in
        // the modal but just overlapping dots at thumbnail scale.
        createEventScatter(
          pitch,
          { ...possessionData, events: possessionData.events.slice(0, 12) },
          { markerRadius: 2, showArrows: true }
        );
        break;
      }
      case "timelineStrip": {
        svg.remove();
        // Same dozen-event trim as eventScatter — fewer glyphs to stack/overlap.
        createTimelineStrip(container$, { ...possessionData, events: possessionData.events.slice(0, 12) }, {
          width: 340,
          height: 110,
          padding: { top: 16, right: 16, bottom: 20, left: 16 },
          glyphRadius: 6,
          stackStep: 16,
        });
        scaleToFit(container);
        break;
      }
      case "xtSurface": {
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard: fit(120, 80),
          padding: PAD,
          theme: pitchTheme,
          showGoals: false,
        });
        createXtSurface(pitch, xtGridData, { opacity: 0.85 });
        break;
      }
      case "playAnimation": {
        const clip = goalAnimationData.goals[0];
        const pitch = createPitch(svg, {
          orientation: "horizontal",
          pxPerYard: fit(120, 80),
          padding: PAD,
          theme: pitchTheme,
          showGoals: false,
        });
        const anim = createPlayAnimation(pitch, clip, {
          ballColor: T.elevated,
          ballStroke: T.text,
          actorColor: T.focal,
          trailOpacity: 0.35,
        });
        anim.controls.seek(clip.window.t_span_seconds * 0.6);
        break;
      }
      case "momentumChart": {
        svg.remove();
        // momentumChart always draws its own home/away team-name labels with no
        // config to hide them — blank the names so the tile isn't cluttered with
        // illegible tiny text at this scale; the curve itself is unaffected.
        createMomentumChart(container$, { ...momentumData, home_team: "", away_team: "" }, {
          orientation: "horizontal",
          width: 300,
          height: 130,
          homeColor: T.focal,
          awayColor: T.secondary,
          showGoals: false,
          showCards: false,
          showSecondaryWindow: false,
        });
        scaleToFit(container);
        break;
      }
    }

    return () => {
      container$.selectAll("*").remove();
    };
  }, [name, side, resolvedTheme]);

  // pointer-events-none: several footballd3 components attach mouseover/tooltip
  // listeners unconditionally with no config to disable them (passNetwork,
  // formation, teamShape, progressiveMap, eventScatter, timelineStrip,
  // xtSurface, momentumChart). Blocking pointer events here stops the browser
  // from ever dispatching to them — no hover/tooltip can fire on a thumbnail,
  // for any of the 16 components, without special-casing each one. The row's
  // own click-to-open handler lives on the ancestor <button> in ComponentRow,
  // so this doesn't affect opening the modal.
  return (
    <div
      ref={ref}
      className="pointer-events-none flex h-[74px] w-[132px] items-center justify-center overflow-hidden"
    />
  );
}
