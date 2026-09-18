import Link from "next/link";
import { aiCards, aiIndexContent } from "@/content/ai";

export default function AiIndex() {
  return (
    <div className="max-w-page px-9 pt-14 pb-10">
      <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">
        {aiIndexContent.eyebrow}
      </div>
      <h1 className="display mb-4.5 text-display-1 leading-[1.03]">{aiIndexContent.heading}</h1>
      <div className="mb-10 max-w-[60ch] text-lg leading-[1.6] text-muted">
        {aiIndexContent.paragraphs.map((paragraph, i) => (
          <p key={i} className={i < aiIndexContent.paragraphs.length - 1 ? "mb-4" : undefined}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* auto-fill, not auto-fit: with a single card, auto-fit collapses the
          empty tracks and stretches this one to fill the whole row instead
          of sitting at a normal card width. auto-fill keeps the phantom
          empty tracks so the fr-share matches a card in a populated row. */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4.5">
        <Link
          href="/ai/match-summary"
          className="overflow-hidden rounded-lg border border-border bg-surface"
        >
          <div className="flex h-[var(--size-card-thumb)] items-center justify-center border-b border-border bg-elevated">
            <svg width="220" height="118" viewBox="0 0 220 118">
              <rect
                x="14"
                y="12"
                width="192"
                height="94"
                rx="4"
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth="1.2"
              />
              <rect x="28" y="26" width="120" height="8" rx="4" fill="var(--focal)" opacity="0.7" />
              <rect x="28" y="42" width="164" height="6" rx="3" fill="var(--muted)" opacity="0.4" />
              <rect x="28" y="54" width="150" height="6" rx="3" fill="var(--muted)" opacity="0.4" />
              <rect x="28" y="66" width="164" height="6" rx="3" fill="var(--muted)" opacity="0.4" />
              <rect x="28" y="84" width="70" height="14" rx="4" fill="var(--secondary-soft)" stroke="var(--secondary)" strokeWidth="1" />
            </svg>
          </div>
          <div className="p-5.5">
            <div className="mb-2.5 font-mono text-mono-sm tracking-[0.1em] text-focal uppercase">
              {aiIndexContent.cardEyebrows.matchSummary}
            </div>
            <div className="mb-1.5 font-display text-display-3 font-semibold">
              {aiCards.matchSummary.title}
            </div>
            <div className="text-sm leading-[1.55] text-muted">{aiCards.matchSummary.blurb}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
