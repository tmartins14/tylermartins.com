import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-[1180px] px-9 pt-[72px] pb-10">
      <h1 className="display mb-6 max-w-[18ch] text-[58px] leading-[1.02] tracking-[-0.015em]">
        Data, made visual and interactive.
      </h1>
      <p className="mb-9 max-w-[56ch] text-lg leading-[1.62] text-muted">
        I&apos;m Tyler, a data engineer who builds things on the side. This is where I turn
        whatever I&apos;m into — starting with football — into tooling, visualizations, and
        interactive pieces. Different subjects, same thread: data.
      </p>

      <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">
        Football
      </div>
      <p className="mb-6 max-w-[56ch] text-sm leading-[1.55] text-muted">
        Match data turned into visual components and analysis. Built on StatsBomb open data.
      </p>

      <div className="grid max-w-[900px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[18px]">
        <Link
          href="/football/components"
          className="rounded-lg border border-border bg-surface p-6"
        >
          <div className="mb-3 font-mono text-[11px] tracking-[0.1em] text-focal uppercase">
            Component library
          </div>
          <div className="mb-2 font-display text-2xl font-semibold">FootballD3 Gallery</div>
          <div className="mb-[18px] text-sm leading-[1.55] text-muted">
            Shot maps, pass networks, xT surfaces — every footballd3 component with sample
            data, a preview, a description, and the code behind it. Built on StatsBomb open
            data.
          </div>
          <div className="font-mono text-xs text-focal">Browse the gallery →</div>
        </Link>

        <Link
          href="/football/dashboard"
          className="rounded-lg border border-border bg-surface p-6"
        >
          <div className="mb-3 font-mono text-[11px] tracking-[0.1em] text-secondary uppercase">
            Match dashboard
          </div>
          <div className="mb-2 font-display text-2xl font-semibold">
            Match Analysis Dashboard
          </div>
          <div className="mb-[18px] text-sm leading-[1.55] text-muted">
            A single game in one view — every shot, pass, and swing of momentum. Built on
            StatsBomb open data.
          </div>
          <svg width="100%" height="66" viewBox="0 0 340 66" preserveAspectRatio="none">
            <line
              x1="0"
              y1="33"
              x2="340"
              y2="33"
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
            <polyline
              points="0,40 34,28 64,46 94,18 124,34 154,10 184,38 214,26 244,50 274,20 304,36 340,30"
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="2"
            />
            <circle cx="154" cy="10" r="3.5" fill="var(--focal)" />
            <circle cx="274" cy="20" r="3.5" fill="var(--focal)" />
          </svg>
          <div className="mt-3.5 font-mono text-xs text-secondary">Open the dashboard →</div>
        </Link>
      </div>
    </div>
  );
}
