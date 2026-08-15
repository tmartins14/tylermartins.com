import type { Side } from "@/lib/componentLibraryData";

/**
 * Owned kit-color dataset (Ticket 2a) — StatsBomb open data carries no kit colors
 * (verified against lineup + match files: only `jersey_number`, nothing color-related).
 *
 * `primary`/`accent` are the true kit colors (may be unusable on the shell, e.g. a
 * white shirt) — for the kit-fidelity chip/swatch, never a data mark. `encoding` is
 * the color actually used for DATA MARKS; it defaults to `primary` and is overridden
 * only when `primary` doesn't work as ink (see England below). `encodingDark` is the
 * dark-mode equivalent, seeded from the values already in `lib/chart-theme.ts`
 * (validated together with the heat-scale work in 2f, not just carried over blind).
 */
export type KitColors = {
  primary: string;
  accent: string;
  encoding: string;
  encodingDark?: string;
};

/**
 * A team's full kit set. Only `home` is populated for now — the StatsBomb sample
 * dataset this site ships covers exactly one match (3943043), and both sides wore
 * their home kit in it (see MATCH_KIT_OVERRIDES below), so there's no real away/third
 * kit data to seed without fabricating colors. `away`/`third` are typed in so a real
 * match that needs them slots in without a schema change — deliberately not required,
 * unlike the handoff bundle's illustrative type snippet (matching it byte-for-byte
 * would mean inventing hex values with no source).
 */
export type TeamKit = {
  home: KitColors;
  away?: KitColors;
  third?: KitColors;
};

/** Per-match record of which kit each side actually wore. */
export type MatchKitOverride = Record<string, Record<string, "home" | "away" | "third">>;

const TEAM_KITS: Record<string, TeamKit> = {
  Spain: {
    home: {
      primary: "#C60B1E",
      accent: "#FFC400",
      encoding: "#C60B1E",
      encodingDark: "#E23744",
    },
  },
  England: {
    home: {
      primary: "#FFFFFF",
      accent: "#001E3C",
      // White is unusable as ink on the #FAF7F0 shell, so encoding overrides to the
      // navy collar/panel accent instead of the (unusable) primary shirt color. This
      // also moves England off #1E3A5F — the exact hex of --secondary — breaking the
      // accidental collision that was masking the S2 color-law inconsistency.
      encoding: "#001E3C",
      encodingDark: "#7FA8D6",
    },
  },
};

/** Verified: both teams wore their home kit in the Euro 2024 Final. */
const MATCH_KIT_OVERRIDES: MatchKitOverride = {
  "3943043": { Spain: "home", England: "home" },
};

/** The one match this site's bundled StatsBomb sample data actually covers — every
 * panel that doesn't (yet) thread a real matchId prop through defaults to it, the
 * same way they already implicitly assume this match via their sample-data imports. */
export const DEFAULT_MATCH_ID = 3943043;

/** Curated last-resort pair for 2d's clash rule — deliberately not focal/secondary
 * (brand color never encodes data, see the color law) or any seeded team encoding.
 * Proposed, not locked: flag for design review if/when a real match actually needs it. */
const CURATED_FALLBACK_PAIR: [string, string] = ["#0F766E", "#C2410C"]; // teal / burnt orange

/** side -> team name, for the one match this dataset actually contains. Extend this
 * (or thread matchId-aware team lookup through) once a second match is seeded. */
const TEAM_FOR_SIDE: Record<Side, string> = { home: "Spain", away: "England" };

function kitForMatch(matchId: number, side: Side): KitColors | undefined {
  const team = TEAM_FOR_SIDE[side];
  const teamKit = TEAM_KITS[team];
  if (!teamKit) return undefined;
  const worn = MATCH_KIT_OVERRIDES[String(matchId)]?.[team] ?? "home";
  return teamKit[worn] ?? teamKit.home;
}

/**
 * The single source of truth for "what color is this team's data" (Ticket 2b) — every
 * panel calls this instead of hard-coding `focal`/`secondary` for a team, so the flip
 * bug (three panels vs. two disagreeing on which color is home) can't recur.
 *
 * `matchId` is last and defaults to `DEFAULT_MATCH_ID` (not the handoff bundle's literal
 * `kitEncoding(matchId, side)` order) — every call site today renders exactly one match,
 * so `kitEncoding("home", mode)` is the common case; multi-match pages can still pass it.
 */
export function kitEncoding(side: Side, mode: "light" | "dark" = "light", matchId: number = DEFAULT_MATCH_ID): string {
  const kit = kitForMatch(matchId, side);
  if (!kit) return mode === "dark" ? "#A39E95" : "#525252"; // --muted fallback, never unset
  if (mode === "dark") return kit.encodingDark ?? kit.encoding;
  return kit.encoding;
}

/** Kit-fidelity chip data (Ticket 2d) — the two-tone identity (primary + accent) that
 * carries a team's full identity in the chip/label/crest, decoupled from the single-hue
 * data-mark encoding. */
export function kitChip(side: Side, matchId: number = DEFAULT_MATCH_ID): { primary: string; accent: string } {
  const kit = kitForMatch(matchId, side);
  return kit ? { primary: kit.primary, accent: kit.accent } : { primary: "#525252", accent: "#525252" };
}

// ---- ΔE clash rule (2d) ----

function hexToLab(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = ((n >> 16) & 255) / 255;
  let g = ((n >> 8) & 255) / 255;
  let b = (n & 255) / 255;
  // sRGB -> linear
  [r, g, b] = [r, g, b].map((c) => (c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92));
  // linear sRGB -> XYZ (D65)
  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
  // XYZ -> Lab (D65 white point)
  const [xn, yn, zn] = [0.95047, 1.0, 1.08883];
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x / xn), f(y / yn), f(z / zn)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIE76 ΔE — adequate for a "too close to tell apart" threshold check, not
 * print-industry color matching. */
export function deltaE(hexA: string, hexB: string): number {
  const [l1, a1, b1] = hexToLab(hexA);
  const [l2, a2, b2] = hexToLab(hexB);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

/** Below this, two encodings read as "the same color" at chart-mark scale. */
const CLASH_THRESHOLD = 20;

/**
 * Resolves a distinguishable [home, away] encoding pair for a match: if the seeded
 * encodings clash, drop the away side to its away/third kit; if still too close (or
 * no away/third kit exists), fall back to the curated pair. Per-match overrides record
 * which kit was actually worn, so real matches rarely trigger this — it exists for the
 * cases where they do.
 */
export function resolveMatchEncodings(
  mode: "light" | "dark" = "light",
  matchId: number = DEFAULT_MATCH_ID
): { home: string; away: string } {
  const home = kitEncoding("home", mode, matchId);
  let away = kitEncoding("away", mode, matchId);

  if (deltaE(home, away) < CLASH_THRESHOLD) {
    const awayTeam = TEAM_FOR_SIDE.away;
    const awayKit = TEAM_KITS[awayTeam];
    const altKit = awayKit?.away ?? awayKit?.third;
    const alt = altKit ? (mode === "dark" ? (altKit.encodingDark ?? altKit.encoding) : altKit.encoding) : undefined;
    away = alt && deltaE(home, alt) >= CLASH_THRESHOLD ? alt : CURATED_FALLBACK_PAIR[1];
  }

  return { home, away };
}
