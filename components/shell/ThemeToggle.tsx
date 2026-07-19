"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Standard next-themes hydration guard: resolvedTheme is unknown on the server,
  // so the glyph/label must stay blank until after the client mounts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1.5 font-mono text-[11px] tracking-wide text-text"
      aria-label="Toggle theme"
    >
      <span>{mounted ? (dark ? "☾" : "☀") : " "}</span>
      <span>{mounted ? (dark ? "DARK" : "LIGHT") : ""}</span>
    </button>
  );
}
