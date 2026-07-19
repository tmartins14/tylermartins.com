export type ComponentCategory = "pitch" | "shots" | "network" | "heat" | "bars" | "line";

export type ComponentEntry = {
  name: string;
  cat: ComponentCategory;
  blurb: string;
  code: string;
};

/** The 16-component footballd3 registry, ported verbatim from the design prototype. */
export const components: ComponentEntry[] = [
  {
    name: "pitch",
    cat: "pitch",
    blurb: "StatsBomb 120×80 pitch base layer. Returns { g, px } for downstream components.",
    code: "const { g, px } = pitch(svg, {\n  mode: 'full', orient: 'horizontal'\n});",
  },
  {
    name: "shotMap",
    cat: "shots",
    blurb: "Shot scatter on a half-pitch. Circle area = xG; color = outcome.",
    code: "shotMap(g, shots, {\n  xg: 'statsbomb_xg'\n});",
  },
  {
    name: "passNetwork",
    cat: "network",
    blurb: "Substitution-windowed directed pass network. Node = pass count; edge = pair count.",
    code: "passNetwork(g, passes, {\n  window: subWindow\n});",
  },
  {
    name: "freezeFrame",
    cat: "pitch",
    blurb: "360 freeze-frame dot overlay for a single goal instant.",
    code: "freezeFrame(g, frame, {\n  actor, keeper\n});",
  },
  {
    name: "convexHull",
    cat: "pitch",
    blurb: "Convex hull territory polygons for offense / defense at a freeze-frame instant.",
    code: "convexHull(g, frame, {\n  side: 'offense'\n});",
  },
  {
    name: "heatmap",
    cat: "heat",
    blurb: "Player on-ball KDE density surface — where a player participated in play.",
    code: "heatmap(g, events, {\n  player: playerId\n});",
  },
  {
    name: "matchStats",
    cat: "bars",
    blurb: "Match-level stat table (shots, possession, xG, cards…). Wraps comparisonBars.",
    code: "matchStats(el, home, away);",
  },
  {
    name: "comparisonBars",
    cat: "bars",
    blurb: "Generic home/away mirrored bar chart. Football-agnostic and reusable.",
    code: "comparisonBars(el, rows, {\n  home, away\n});",
  },
  {
    name: "formation",
    cat: "pitch",
    blurb: "Declared formation and tactical-shift sequence with template-slot positions.",
    code: "formation(g, '4-3-3', {\n  shifts\n});",
  },
  {
    name: "teamShape",
    cat: "network",
    blurb: "Empirical in-possession nodes and out-of-possession density cloud.",
    code: "teamShape(g, events, {\n  phase: 'in'\n});",
  },
  {
    name: "progressiveMap",
    cat: "pitch",
    blurb: "Progressive pass/carry arrows on the full pitch. Encodes completion + progression.",
    code: "progressiveMap(g, actions);",
  },
  {
    name: "eventScatter",
    cat: "pitch",
    blurb: "General event scatter. Markers at (x,y); arrows for Pass/Carry/Shot.",
    code: "eventScatter(g, events, {\n  color: byType\n});",
  },
  {
    name: "timelineStrip",
    cat: "line",
    blurb:
      "Single-possession elapsed-seconds strip. Real-time axis; stacks near-simultaneous events.",
    code: "timelineStrip(el, possession);",
  },
  {
    name: "xtSurface",
    cat: "heat",
    blurb: "Karun Singh open xT grid as a heatmap beneath pitch markings.",
    code: "xtSurface(g, {\n  grid: xtGrid\n});",
  },
  {
    name: "playAnimation",
    cat: "pitch",
    blurb: "Time-windowed ball-path animation with play/pause/scrub. Composes on pitch.",
    code: "playAnimation(g, track, {\n  window: [t0, t1]\n});",
  },
  {
    name: "momentumChart",
    cat: "line",
    blurb: "Per-minute xT-based attacking momentum curve with goal/card markers.",
    code: "momentumChart(el, xt, {\n  orient: 'horizontal'\n});",
  },
];
