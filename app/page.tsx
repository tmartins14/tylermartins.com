import Link from "next/link";
import { homeContent } from "@/content/site";
import { footballCards } from "@/content/football";

export default function Home() {
  return (
    <div className="max-w-[1180px] px-9 pt-[72px] pb-10">
      <h1 className="display mb-6 max-w-[18ch] text-[58px] leading-[1.02] tracking-[-0.015em]">
        {homeContent.hero.headline}
      </h1>
      <p className="mb-9 max-w-[56ch] text-lg leading-[1.62] text-muted">
        {homeContent.hero.subhead}
      </p>

      <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">
        {homeContent.footballTeaser.eyebrow}
      </div>
      <p className="mb-6 max-w-[56ch] text-sm leading-[1.55] text-muted">
        {homeContent.footballTeaser.intro}
      </p>

      <div className="grid max-w-[900px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[18px]">
        <Link
          href="/football/components"
          className="rounded-lg border border-border bg-surface p-6"
        >
          <div className="mb-3 font-mono text-[11px] tracking-[0.1em] text-focal uppercase">
            {homeContent.cards.components.eyebrow}
          </div>
          <div className="mb-2 font-display text-2xl font-semibold">
            {footballCards.components.title}
          </div>
          <div className="mb-[18px] text-sm leading-[1.55] text-muted">
            {footballCards.components.blurb}
          </div>
          <div className="font-mono text-xs text-focal">{homeContent.cards.components.cta}</div>
        </Link>

        <Link
          href="/football/dashboard"
          className="rounded-lg border border-border bg-surface p-6"
        >
          <div className="mb-3 font-mono text-[11px] tracking-[0.1em] text-secondary uppercase">
            {homeContent.cards.dashboard.eyebrow}
          </div>
          <div className="mb-2 font-display text-2xl font-semibold">
            {footballCards.dashboard.title}
          </div>
          <div className="mb-[18px] text-sm leading-[1.55] text-muted">
            {footballCards.dashboard.blurb}
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
          <div className="mt-3.5 font-mono text-xs text-secondary">
            {homeContent.cards.dashboard.cta}
          </div>
        </Link>
      </div>
    </div>
  );
}
