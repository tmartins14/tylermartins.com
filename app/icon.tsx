import { ImageResponse } from "next/og";

// Ticket 3d — replaces the default Next.js favicon.ico with the site's own
// mark (matches components/shell/Rail.tsx's brand glyph: focal-red square,
// white "T"). No custom font load needed at this size — a heavy system
// sans reads fine at 32px, and it keeps this route dependency-free.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#9F1239",
          borderRadius: 6,
          color: "#FAF7F0",
          fontSize: 22,
          fontWeight: 900,
        }}
      >
        T
      </div>
    ),
    { ...size }
  );
}
