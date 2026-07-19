import type { ComponentCategory } from "@/lib/components";

/** Schematic placeholder preview, keyed by category. Real footballd3 mounts land here later. */
export function ComponentPreview({ cat }: { cat: ComponentCategory }) {
  switch (cat) {
    case "pitch":
      return (
        <svg width="150" height="120" viewBox="0 0 150 120">
          <rect
            x="4"
            y="4"
            width="142"
            height="112"
            rx="4"
            fill="none"
            stroke="var(--pitch)"
            strokeWidth="1.2"
          />
          <line
            x1="75"
            y1="4"
            x2="75"
            y2="116"
            stroke="var(--pitch)"
            opacity="0.45"
            strokeWidth="1"
          />
          <circle
            cx="75"
            cy="60"
            r="16"
            fill="none"
            stroke="var(--pitch)"
            opacity="0.45"
            strokeWidth="1"
          />
          <rect
            x="4"
            y="34"
            width="20"
            height="52"
            fill="none"
            stroke="var(--pitch)"
            opacity="0.45"
            strokeWidth="1"
          />
          <rect
            x="126"
            y="34"
            width="20"
            height="52"
            fill="none"
            stroke="var(--pitch)"
            opacity="0.45"
            strokeWidth="1"
          />
          <circle cx="40" cy="46" r="4" fill="var(--focal)" />
          <circle cx="58" cy="72" r="4" fill="var(--focal)" />
          <circle cx="98" cy="52" r="4" fill="var(--secondary)" />
          <circle cx="112" cy="80" r="4" fill="var(--secondary)" />
        </svg>
      );
    case "shots":
      return (
        <svg width="128" height="130" viewBox="0 0 128 130">
          <rect
            x="2"
            y="2"
            width="124"
            height="126"
            rx="4"
            fill="none"
            stroke="var(--pitch)"
            strokeWidth="1.2"
          />
          <rect
            x="32"
            y="2"
            width="64"
            height="40"
            fill="none"
            stroke="var(--pitch)"
            opacity="0.5"
            strokeWidth="1"
          />
          <path
            d="M 42 42 A 22 22 0 0 0 86 42"
            fill="none"
            stroke="var(--pitch)"
            opacity="0.5"
            strokeWidth="1"
          />
          <circle
            cx="60"
            cy="62"
            r="15"
            fill="var(--focal-soft)"
            stroke="var(--focal)"
            strokeWidth="1.4"
          />
          <circle
            cx="82"
            cy="82"
            r="8"
            fill="var(--focal-soft)"
            stroke="var(--focal)"
            strokeWidth="1.2"
          />
          <circle
            cx="44"
            cy="90"
            r="11"
            fill="var(--focal-soft)"
            stroke="var(--focal)"
            strokeWidth="1.2"
          />
          <circle
            cx="90"
            cy="108"
            r="5"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="1.2"
          />
        </svg>
      );
    case "network":
      return (
        <svg width="150" height="120" viewBox="0 0 150 120">
          <rect
            x="4"
            y="4"
            width="142"
            height="112"
            rx="4"
            fill="none"
            stroke="var(--pitch)"
            opacity="0.5"
            strokeWidth="1.1"
          />
          <line
            x1="38"
            y1="34"
            x2="74"
            y2="60"
            stroke="var(--secondary)"
            opacity="0.55"
            strokeWidth="3"
          />
          <line
            x1="74"
            y1="60"
            x2="110"
            y2="40"
            stroke="var(--secondary)"
            opacity="0.55"
            strokeWidth="4"
          />
          <line
            x1="74"
            y1="60"
            x2="60"
            y2="94"
            stroke="var(--secondary)"
            opacity="0.55"
            strokeWidth="2"
          />
          <line
            x1="110"
            y1="40"
            x2="108"
            y2="86"
            stroke="var(--secondary)"
            opacity="0.55"
            strokeWidth="2.5"
          />
          <circle cx="38" cy="34" r="8" fill="var(--focal)" />
          <circle cx="74" cy="60" r="12" fill="var(--focal)" />
          <circle cx="110" cy="40" r="10" fill="var(--focal)" />
          <circle cx="60" cy="94" r="7" fill="var(--focal)" />
          <circle cx="108" cy="86" r="8" fill="var(--focal)" />
        </svg>
      );
    case "heat":
      return (
        <svg width="150" height="120" viewBox="0 0 150 120">
          <rect
            x="4"
            y="4"
            width="142"
            height="112"
            rx="4"
            fill="none"
            stroke="var(--pitch)"
            strokeWidth="1.2"
          />
          <rect x="20" y="20" width="26" height="26" fill="var(--focal)" opacity="0.15" />
          <rect x="46" y="20" width="26" height="26" fill="var(--focal)" opacity="0.32" />
          <rect x="72" y="20" width="26" height="26" fill="var(--focal)" opacity="0.2" />
          <rect x="46" y="46" width="26" height="26" fill="var(--focal)" opacity="0.62" />
          <rect x="72" y="46" width="26" height="26" fill="var(--focal)" opacity="0.85" />
          <rect x="98" y="46" width="26" height="26" fill="var(--focal)" opacity="0.4" />
          <rect x="46" y="72" width="26" height="26" fill="var(--focal)" opacity="0.28" />
          <rect x="72" y="72" width="26" height="26" fill="var(--focal)" opacity="0.5" />
        </svg>
      );
    case "bars":
      return (
        <svg width="160" height="120" viewBox="0 0 160 120">
          <line
            x1="80"
            y1="8"
            x2="80"
            y2="112"
            stroke="var(--border-strong)"
            strokeWidth="1"
          />
          <rect x="20" y="18" width="56" height="12" rx="2" fill="var(--focal)" />
          <rect x="84" y="18" width="40" height="12" rx="2" fill="var(--secondary)" />
          <rect x="36" y="40" width="40" height="12" rx="2" fill="var(--focal)" />
          <rect x="84" y="40" width="58" height="12" rx="2" fill="var(--secondary)" />
          <rect x="30" y="62" width="46" height="12" rx="2" fill="var(--focal)" />
          <rect x="84" y="62" width="30" height="12" rx="2" fill="var(--secondary)" />
          <rect x="44" y="84" width="32" height="12" rx="2" fill="var(--focal)" />
          <rect x="84" y="84" width="48" height="12" rx="2" fill="var(--secondary)" />
        </svg>
      );
    case "line":
      return (
        <svg width="164" height="110" viewBox="0 0 164 110">
          <line
            x1="6"
            y1="55"
            x2="158"
            y2="55"
            stroke="var(--border-strong)"
            strokeWidth="1"
          />
          <polyline
            points="6,60 26,44 46,66 66,30 86,52 106,20 126,58 146,38 158,48"
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="2.2"
          />
          <circle cx="66" cy="30" r="4" fill="var(--focal)" />
          <circle cx="106" cy="20" r="4" fill="var(--focal)" />
        </svg>
      );
  }
}
