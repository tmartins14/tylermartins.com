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
