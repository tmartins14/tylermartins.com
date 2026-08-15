import { ImageResponse } from "next/og";

// Ticket 3d — one shared, designed OG image template across every route
// (route-level title/description already vary per page; the bundle asked for
// "a designed OG image template," not bespoke art per route). Brand surface:
// Fraunces "T" mark on the paper shell + one hero viz (a shot map, the site's
// most recognizable chart), ink disciplined per the color law — focal red for
// the mark and one team's shots, secondary navy for the other, nothing else.
export const alt = "tylermartins.com — football data, turned into tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#FAF7F0";
const INK = "#171717";
const MUTED = "#525252";
const FOCAL = "#9F1239";
const SECONDARY = "#1E3A5F";
const BORDER = "#D6D3CC";

/** Google Fonts CSS2 API — same pattern Next.js's own OG-image examples use:
 * query the CSS for just the glyphs this image needs, extract the actual font
 * file URL, fetch that. Generic across family/weight so both fonts below share
 * one loader.
 *
 * The `text` param matters beyond payload size: Satori has no real "sans-serif"
 * or "serif" fallback family to resolve a generic CSS keyword against — every
 * fontFamily used anywhere in the tree must be an explicitly registered font,
 * or Satori patches per-glyph between whichever registered fonts happen to
 * contain that character and its own internal fallback. Confirmed by rendering
 * this image with only Fraunces registered and the subhead/footer declared
 * `fontFamily: "sans-serif"`: text came out visibly mixed serif/bold glyph by
 * glyph (e.g. "StatsBomb" alternating styles letter to letter) because those
 * strings share some characters with the Fraunces subset and not others. Fix
 * is to register a second real font (Inter) and reference it by name — never
 * a generic family keyword — and to scope each font's `text` param to exactly
 * the characters it's actually asked to render. */
async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const title = "tylermartins.com";
  const subhead = "Football data, turned into tools";
  const footerLeft = "Built on StatsBomb open data";
  const footerRight = "tylermartins.com";

  // "T" mark + headline use Fraunces; subset to exactly those characters.
  // Subhead + footer use Inter; subset to exactly that text, separately —
  // deliberately NOT sharing one combined subset across both fonts, since
  // each font's `text` param should only ever cover glyphs that font is
  // actually asked to render (see loadGoogleFont's comment above).
  const [fraunces, inter] = await Promise.all([
    loadGoogleFont("Fraunces", 900, `T${title}`),
    loadGoogleFont("Inter", 600, `${subhead}${footerLeft}${footerRight}`),
  ]);
  const displayFont = fraunces ? "Fraunces" : "sans-serif";
  // Falls back to displayFont, not the generic "sans-serif" keyword: if Inter's
  // fetch fails but Fraunces's succeeded, "sans-serif" would still be an
  // unregistered name with Fraunces present in the font list, reproducing the
  // exact per-glyph mixing bug this file was just fixed for. Falling back to
  // whatever displayFont resolved to keeps the image self-consistent even in
  // that failure case (both fonts, or neither, never a partial mismatch).
  const bodyFont = inter ? "Inter" : displayFont;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          padding: 64,
          fontFamily: displayFont,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 12,
              background: FOCAL,
              color: PAPER,
              fontSize: 44,
              fontWeight: 900,
            }}
          >
            T
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: INK }}>{title}</div>
            <div style={{ fontSize: 22, color: MUTED, fontFamily: bodyFont }}>{subhead}</div>
          </div>
        </div>

        {/* Hero viz: a half-pitch shot map, the site's most recognizable chart —
            same visual language as the football-section card thumbnails. */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <svg width="520" height="360" viewBox="0 0 520 360">
            <rect x="20" y="20" width="480" height="320" rx="6" fill="none" stroke={BORDER} strokeWidth="3" />
            <rect x="160" y="20" width="200" height="90" fill="none" stroke={BORDER} strokeWidth="3" />
            <circle cx="260" cy="150" r="60" fill="none" stroke={BORDER} strokeWidth="2" />
            {/* Shots — focal (home) and secondary (away), sized by a stand-in xG, tiered by outcome. */}
            <circle cx="220" cy="90" r="26" fill={FOCAL} opacity="0.85" />
            <circle cx="300" cy="70" r="14" fill="none" stroke={FOCAL} strokeWidth="3" />
            <circle cx="180" cy="130" r="10" fill="none" stroke={FOCAL} strokeWidth="3" strokeDasharray="3 3" />
            <circle cx="340" cy="120" r="18" fill={SECONDARY} opacity="0.85" />
            <circle cx="240" cy="150" r="9" fill="none" stroke={SECONDARY} strokeWidth="3" strokeDasharray="3 3" />
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: MUTED, fontFamily: bodyFont }}>
          <div>{footerLeft}</div>
          <div>{footerRight}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(fraunces ? [{ name: "Fraunces", data: fraunces, weight: 900 as const, style: "normal" as const }] : []),
        ...(inter ? [{ name: "Inter", data: inter, weight: 600 as const, style: "normal" as const }] : []),
      ],
    }
  );
}
