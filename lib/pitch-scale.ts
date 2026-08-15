/**
 * Desktop-tuned pxPerYard cap for the standard half-pitch views (Formation,
 * ShotMap, PassNetwork, TeamShape, PlayAnimation). Named so it's one value to
 * tune, not five repeated literals — see DESIGN.md "Spacing & layout constants".
 * Full-pitch/goal-mouth views (TerritoryPanel, GoalsBuildupPanel) use their own
 * caps (4.4 / 1.25) since their aspect ratios differ.
 */
export const MAX_PX_PER_YARD = 3.2;

/**
 * Derives pxPerYard from a measured container width so pitch SVGs (fixed-size by
 * design in footballd3/pitch.js) scale down on narrow viewports instead of
 * overflowing, while never exceeding the desktop-tuned maxPxPerYard.
 */
export function computePxPerYard(
  containerWidth: number,
  axisYards: number,
  padding: number,
  maxPxPerYard: number,
  minPxPerYard = 0.6
): number {
  const fit = (containerWidth - padding * 2) / axisYards;
  return Math.min(maxPxPerYard, Math.max(minPxPerYard, fit));
}
