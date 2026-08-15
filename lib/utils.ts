import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge doesn't know about this project's custom @theme tokens
 * (app/globals.css) — it only recognizes Tailwind's own default scale. Left
 * unregistered, a custom class sharing the "text-" prefix with a real Tailwind
 * group (font-size vs. text-color) gets misclassified and SILENTLY DROPPED
 * whenever it's merged alongside a class from the group tailwind-merge thinks
 * it belongs to. Confirmed and fixed after a real bug: every button using the
 * type-ramp size tokens (ToggleGroup, DashboardTabBar, ...) rendered at the
 * browser's inherited 16px instead of the intended 11px, because
 * `cn("text-mono-sm ...", "text-focal")` — a completely ordinary
 * size-class + conditional-color-class call, the standard pattern used all
 * over this codebase — silently resolved to just `text-focal`, no font-size
 * class surviving at all. Verified empirically (see the fix's PR) that this
 * reproduced for every custom size token paired with every text-color token,
 * every time. Registering the custom scale here is the fix for all of them at
 * once, not a per-component patch.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-1",
        "text-display-2",
        "text-display-3",
        "text-display-4",
        "text-score",
        "text-mono-base",
        "text-mono-sm",
        "text-mono-xs",
      ],
      // Not currently combined with another color in the same cn() call
      // anywhere, but registering defensively — same failure mode, same fix.
      "text-color": ["text-team-home", "text-team-away"],
      "bg-color": ["bg-team-home", "bg-team-away"],
      "border-color": ["border-team-home", "border-team-away"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
