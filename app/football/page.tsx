import Link from "next/link";

export default function FootballIndex() {
  return (
    <div className="max-w-[1180px] px-9 pt-14 pb-10">
      <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">
        Section
      </div>
      <h1 className="display mb-[18px] text-[46px] leading-[1.03]">Football</h1>
      <p className="mb-10 max-w-[60ch] text-[17px] leading-[1.6] text-muted">
        Match data turned into visual components and analysis. Built on StatsBomb open data.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[18px]">
        <Link
          href="/football/components"
          className="overflow-hidden rounded-lg border border-border bg-surface"
        >
          <div className="flex h-[150px] items-center justify-center border-b border-border bg-elevated">
            <svg width="220" height="118" viewBox="0 0 220 118">
              <rect
                x="8"
                y="8"
                width="96"
                height="102"
                rx="4"
                fill="none"
                stroke="var(--pitch)"
                strokeWidth="1.2"
              />
              <circle
                cx="46"
                cy="52"
                r="14"
                fill="var(--focal-soft)"
                stroke="var(--focal)"
                strokeWidth="1.3"
              />
              <circle
                cx="72"
                cy="74"
                r="8"
                fill="var(--focal-soft)"
                stroke="var(--focal)"
                strokeWidth="1.1"
              />
              <rect
                x="120"
                y="14"
                width="90"
                height="26"
                rx="3"
                fill="var(--secondary-soft)"
                stroke="var(--secondary)"
                strokeWidth="1"
              />
              <rect
                x="120"
                y="48"
                width="66"
                height="26"
                rx="3"
                fill="var(--secondary-soft)"
                stroke="var(--secondary)"
                strokeWidth="1"
              />
              <rect
                x="120"
                y="82"
                width="78"
                height="26"
                rx="3"
                fill="var(--focal-soft)"
                stroke="var(--focal)"
                strokeWidth="1"
              />
            </svg>
          </div>
          <div className="p-[22px]">
            <div className="mb-2.5 font-mono text-[11px] tracking-[0.1em] text-focal uppercase">
              Content type · library
            </div>
            <div className="mb-1.5 font-display text-[23px] font-semibold">
              FootballD3 Gallery
            </div>
            <div className="text-sm leading-[1.55] text-muted">
              Shot maps, pass networks, xT surfaces — every footballd3 component with sample
              data, a preview, a description, and the code behind it. Built on StatsBomb open
              data.
            </div>
          </div>
        </Link>

        <Link
          href="/football/dashboard"
          className="overflow-hidden rounded-lg border border-border bg-surface"
        >
          <div className="flex h-[150px] items-center justify-center border-b border-border bg-elevated">
            <svg width="220" height="118" viewBox="0 0 220 118">
              <rect
                x="8"
                y="8"
                width="204"
                height="102"
                rx="4"
                fill="none"
                stroke="var(--pitch)"
                strokeWidth="1.2"
              />
              <line
                x1="110"
                y1="8"
                x2="110"
                y2="110"
                stroke="var(--pitch)"
                opacity="0.5"
                strokeWidth="1"
              />
              <circle
                cx="110"
                cy="59"
                r="15"
                fill="none"
                stroke="var(--pitch)"
                opacity="0.5"
                strokeWidth="1"
              />
              <circle cx="60" cy="45" r="6" fill="var(--focal)" />
              <circle cx="85" cy="70" r="6" fill="var(--focal)" />
              <circle cx="150" cy="50" r="6" fill="var(--secondary)" />
              <circle cx="170" cy="78" r="6" fill="var(--secondary)" />
              <line
                x1="60"
                y1="45"
                x2="85"
                y2="70"
                stroke="var(--focal)"
                opacity="0.6"
                strokeWidth="2"
              />
              <line
                x1="150"
                y1="50"
                x2="170"
                y2="78"
                stroke="var(--secondary)"
                opacity="0.6"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="p-[22px]">
            <div className="mb-2.5 font-mono text-[11px] tracking-[0.1em] text-secondary uppercase">
              Content type · dashboard
            </div>
            <div className="mb-1.5 font-display text-[23px] font-semibold">
              Match Analysis Dashboard
            </div>
            <div className="text-sm leading-[1.55] text-muted">
              A single game in one view — every shot, pass, and swing of momentum. Built on
              StatsBomb open data.
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
