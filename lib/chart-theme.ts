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
  },
} as const;

export type ChartThemeTokens = (typeof CHART_THEME)["light"];
