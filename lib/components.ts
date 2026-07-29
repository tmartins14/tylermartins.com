export type ComponentCategory = "pitch" | "shots" | "network" | "heat" | "bars" | "line";

/** Display order + label for the gallery's category sections. */
export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  pitch: "Pitch overlays",
  shots: "Shots",
  network: "Network & shape",
  heat: "Heat surfaces",
  bars: "Bars & tables",
  line: "Time series",
};

export const CATEGORY_ORDER: ComponentCategory[] = [
  "pitch",
  "shots",
  "network",
  "heat",
  "bars",
  "line",
];

export type ModeOption = { value: string; label: string };

/**
 * Shared stage box + scale for every pitch-rendering component, so a yard is
 * the same number of pixels everywhere and the container is the same size
 * regardless of which component is open.
 */
export const PITCH_STAGE = { w: 620, h: 420 };

export type ComponentEntry = {
  name: string;
  cat: ComponentCategory;
  blurb: string;
  code: string;
  /** Data is team-specific — show the Spain/England segmented control. */
  teamAware?: boolean;
  /** Per-component view modes, shown as a segmented control. */
  modes?: ModeOption[];
  defaultMode?: string;
  /** A second, independent segmented control (currently only momentumChart's
   * Horizontal/Vertical orientation, alongside its Curve/Bars `modes`). */
  orientationModes?: ModeOption[];
  defaultOrientationMode?: string;
  /** Show the play/pause/scrub transport (playAnimation only). */
  hasPlayback?: boolean;
  /** Modal stage container size — see README "Stage sizing (modal)". */
  stage: { w: number; h: number };
  /** data/football source file(s) feeding this component, for the Sample data rail. */
  sample: string[];
  /** ISO date (YYYY-MM-DD) this component first shipped. Drives gallery ordering. */
  publishedDate: string;
};

/** The 16-component footballd3 registry, ported verbatim from the design prototype. */
export const components: ComponentEntry[] = [
  {
    name: "pitch",
    cat: "pitch",
    blurb: "StatsBomb 120×80 pitch base layer. Returns { g, px } for downstream components.",
    code: "const { g, px } = pitch(svg, {\n  mode: 'full', orient: 'horizontal'\n});",
    modes: [
      { value: "horizontal", label: "Horizontal" },
      { value: "vertical", label: "Vertical" },
    ],
    defaultMode: "horizontal",
    stage: PITCH_STAGE,
    sample: [],
    publishedDate: "2026-07-28",
  },
  {
    name: "shotMap",
    cat: "shots",
    blurb: "Shot scatter on a half-pitch. Circle area = xG; color = outcome.",
    code: "shotMap(g, shots, {\n  xg: 'statsbomb_xg'\n});",
    teamAware: true,
    stage: PITCH_STAGE,
    sample: ["shots_3943043.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "passNetwork",
    cat: "network",
    blurb: "Substitution-windowed directed pass network. Node = pass count; edge = pair count.",
    code: "passNetwork(g, passes, {\n  window: subWindow\n});",
    teamAware: true,
    stage: PITCH_STAGE,
    sample: ["pass_network_3943043_Spain.json", "pass_network_3943043_England.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "freezeFrame",
    cat: "pitch",
    blurb: "360 freeze-frame dot overlay for a single goal instant.",
    code: "freezeFrame(g, frame, {\n  actor, keeper\n});",
    stage: PITCH_STAGE,
    sample: ["freeze_frames_3943043_goals.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "convexHull",
    cat: "pitch",
    blurb: "Convex hull territory polygons for offense / defense at a freeze-frame instant.",
    code: "convexHull(g, frame, {\n  side: 'offense'\n});",
    modes: [
      { value: "offense", label: "Offense" },
      { value: "defense", label: "Defense" },
    ],
    defaultMode: "offense",
    stage: PITCH_STAGE,
    sample: ["convex_hull_3943043_goals.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "heatmap",
    cat: "heat",
    blurb: "Player on-ball KDE density surface — where a player participated in play.",
    code: "heatmap(g, events, {\n  player: playerId\n});",
    stage: PITCH_STAGE,
    sample: ["heatmap_3943043_lamine_yamal_nasraoui_ebana.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "matchStats",
    cat: "bars",
    blurb: "Match-level stat table (shots, possession, xG, cards…). Wraps comparisonBars.",
    code: "matchStats(el, home, away);",
    stage: { w: 620, h: 400 },
    sample: ["match_stats_3943043.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "comparisonBars",
    cat: "bars",
    blurb: "Generic home/away mirrored bar chart. Football-agnostic and reusable.",
    code: "comparisonBars(el, rows, {\n  home, away\n});",
    stage: { w: 620, h: 400 },
    sample: ["sample rows (illustrative, not match data)"],
    publishedDate: "2026-07-28",
  },
  {
    name: "formation",
    cat: "pitch",
    blurb: "Declared formation and tactical-shift sequence with template-slot positions.",
    code: "formation(g, '4-3-3', {\n  shifts\n});",
    teamAware: true,
    stage: PITCH_STAGE,
    sample: ["formation_3943043_spain.json", "formation_3943043_england.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "teamShape",
    cat: "network",
    blurb: "Empirical in-possession nodes and out-of-possession density cloud.",
    code: "teamShape(g, events, {\n  phase: 'in'\n});",
    teamAware: true,
    modes: [
      { value: "in", label: "In poss." },
      { value: "out", label: "Out poss." },
    ],
    defaultMode: "in",
    stage: PITCH_STAGE,
    sample: ["team_shape_3943043_spain.json", "team_shape_3943043_england.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "progressiveMap",
    cat: "pitch",
    blurb: "Progressive pass/carry arrows on the full pitch. Encodes completion + progression.",
    code: "progressiveMap(g, actions);",
    teamAware: true,
    modes: [
      { value: "pass", label: "Passes" },
      { value: "carry", label: "Carries" },
      { value: "all", label: "All" },
    ],
    defaultMode: "pass",
    stage: PITCH_STAGE,
    sample: ["progressive_map_3943043_spain.json", "progressive_map_3943043_england.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "eventScatter",
    cat: "pitch",
    blurb: "General event scatter. Markers at (x,y); arrows for Pass/Carry/Shot.",
    code: "eventScatter(g, events, {\n  color: byType\n});",
    modes: [
      { value: "all", label: "All" },
      { value: "pass", label: "Pass" },
      { value: "shot", label: "Shot" },
    ],
    defaultMode: "all",
    stage: PITCH_STAGE,
    sample: ["possession_3943043_60.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "timelineStrip",
    cat: "line",
    blurb:
      "Single-possession elapsed-seconds strip. Real-time axis; stacks near-simultaneous events.",
    code: "timelineStrip(el, possession);",
    stage: { w: 620, h: 400 },
    sample: ["possession_3943043_60.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "xtSurface",
    cat: "heat",
    blurb: "Karun Singh open xT grid as a heatmap beneath pitch markings.",
    code: "xtSurface(g, {\n  grid: xtGrid\n});",
    stage: PITCH_STAGE,
    sample: ["xt_grid.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "playAnimation",
    cat: "pitch",
    blurb: "Time-windowed ball-path animation with play/pause/scrub. Composes on pitch.",
    code: "playAnimation(g, track, {\n  window: [t0, t1]\n});",
    hasPlayback: true,
    stage: PITCH_STAGE,
    sample: ["goal_animation_3943043.json"],
    publishedDate: "2026-07-28",
  },
  {
    name: "momentumChart",
    cat: "line",
    blurb: "Per-minute xT-based attacking momentum curve with goal/card markers.",
    code: "momentumChart(el, xt, {\n  orient: 'horizontal'\n});",
    modes: [
      { value: "curve", label: "Curve" },
      { value: "bars", label: "Bars" },
    ],
    defaultMode: "curve",
    orientationModes: [
      { value: "horizontal", label: "Horizontal" },
      { value: "vertical", label: "Vertical" },
    ],
    defaultOrientationMode: "horizontal",
    stage: { w: 620, h: 400 },
    sample: ["momentum_3943043.json"],
    publishedDate: "2026-07-28",
  },
];
