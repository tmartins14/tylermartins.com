import { ImageResponse } from "next/og";

// Same mark as icon.tsx, standard apple-touch-icon size (no rounded corners —
// iOS applies its own mask/rounding to whatever square it's given).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          color: "#FAF7F0",
          fontSize: 120,
          fontWeight: 900,
        }}
      >
        T
      </div>
    ),
    { ...size }
  );
}
