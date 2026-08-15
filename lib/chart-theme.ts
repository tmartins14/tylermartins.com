import { kitEncoding } from "@/lib/kits";

/**
 * Hardcoded light/dark hex tables mirroring app/globals.css. The vendored
 * footballd3 components take hex config, not live CSS vars, so each chart
 * wrapper looks values up here and remounts on theme change.
 */
export const CHART_THEME = {
  light: {
    background: "#FAF7F0",
    surface: "#FFFDF8",
    elevated: "#FFFFFF",
    border: "#E5E5E5",
    text: "#171717",
    muted: "#525252",
    faint: "#8A8578",
    focal: "#9F1239",
    secondary: "#1E3A5F",
    pitch: "#1E3A5F",
    grid: "#ECE8DF",
    // Team encodings (Ticket 2b) — sourced from lib/kits.ts, the one place these
    // values are seeded, so this table and the dashboard's home/away colors can't
    // drift apart again the way england's did (it used to hardcode #1E3A5F here,
    // an accidental byte-for-byte collision with `secondary` above).
    spain: kitEncoding("home", "light"),
    england: kitEncoding("away", "light"),
  },
  dark: {
    background: "#1A1613",
    surface: "#211D18",
    elevated: "#2A2521",
    border: "#34302A",
    text: "#F5F0E6",
    muted: "#A39E95",
    faint: "#78716C",
    focal: "#F43F5E",
    secondary: "#5B8AC0",
    pitch: "#5B8AC0",
    grid: "#2A2521",
    spain: kitEncoding("home", "dark"),
    england: kitEncoding("away", "dark"),
  },
};

export type ChartThemeTokens = (typeof CHART_THEME)["light"];

/**
 * The named warm-anchored sequential heat scale (Ticket 2f) — used by every heat/
 * territory surface (TerritoryPanel today, xT surfaces if/when they render density)
 * regardless of which team is selected, so the ramp's meaning stays constant instead
 * of shifting per team the way `colorHigh: teamColor` used to. Endpoints stay on
 * adjacent warm hues (cream -> amber/orange) rather than crossing through unrelated
 * hues, so a naive two-stop interpolation doesn't muddy the middle of the ramp.
 * Proposed default (like the type ramp / motion tokens) — flagged for a visual pass,
 * not a locked decision.
 */
export const HEAT_SCALE = {
  light: { low: CHART_THEME.light.background, high: "#B45309" },
  dark: { low: CHART_THEME.dark.background, high: "#F59E0B" },
};
