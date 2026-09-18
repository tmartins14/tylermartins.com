import type { Metadata } from "next";
import { getMatchSummary } from "@/lib/match-summary";
import { MatchSummaryContent } from "@/components/charts/MatchSummaryContent";
import { StatsBombAttribution } from "@/components/StatsBombAttribution";
import { metadata as contentMetadata } from "./content.mdx";

export const metadata: Metadata = {
  title: contentMetadata.title,
  description: contentMetadata.description,
  // See the matching comment in app/football/dashboard/page.tsx — a nested
  // segment's own `openGraph`/`twitter` object replaces the root layout's
  // entirely (not a deep merge), and the shared opengraph-image.tsx file
  // convention doesn't cascade to nested routes either, so every field this
  // route wants — including the image — has to be repeated here.
  openGraph: {
    title: contentMetadata.title,
    description: contentMetadata.description,
    url: "/ai/match-summary",
    siteName: "tylermartins.com",
    type: "website",
    locale: "en_US",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: contentMetadata.title,
    description: contentMetadata.description,
    images: ["/opengraph-image"],
  },
};

export default function MatchSummaryShowcase() {
  const matchSummary = getMatchSummary();

  return (
    <div className="px-4 py-4 dash:px-9 dash:py-10">
      <div className="mx-auto max-w-page">
        <div className="mb-7 max-w-[82ch]">
          <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">
            AI · match summary
          </div>
          <h1 className="display mb-4 text-display-2 leading-[1.05]">{contentMetadata.title}</h1>
        </div>

        <div className="mb-8 overflow-hidden rounded-2xl border border-border-strong bg-background p-5.5 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.7)] dash:p-7">
          <MatchSummaryContent data={matchSummary} />
        </div>

        <div className="mx-auto flex max-w-[72ch] flex-col gap-8">
          <section>
            <div className="mb-2.5 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">
              What it does
            </div>
            <p className="text-base leading-[1.6] text-text">
              Takes the full StatsBomb event data for a match and generates a structured outcome
              (headline, key stats, standout performers) plus free-form tactics prose. It lives
              inside the Match Analysis Dashboard&apos;s Match Summary modal — the output above is
              the same generated content, shown here without the dialog.
            </p>
          </section>

          <section>
            <div className="mb-2.5 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">
              How it was built
            </div>
            <p className="mb-3 text-base leading-[1.6] text-text">
              A Python script, <code className="font-mono text-mono-sm">generate_match_summary.py</code>,
              loads a match&apos;s extracted data — stats, formations, team shape, pass networks —
              and calls a Claude model twice: once in structured-output mode for the outcome
              section, once for free-form tactics prose. The result is written once per match ID
              to a static JSON file; the site only ever reads that file, no model call happens at
              request time.
            </p>
            <p className="text-base leading-[1.6] text-text">
              Splitting the two calls was deliberate. A field like &quot;standout performer&quot;
              reads as objective, but which stats count as key and who counts as standout is an
              editorial call the model is making, not a fact it&apos;s reporting. Keeping that
              judgment call in one narrow, structured call — separate from the open-ended tactics
              prose — made it easier to see where the model&apos;s interpretation was entering the
              output, instead of it being spread across the whole thing.
            </p>
          </section>

          <section>
            <div className="mb-2.5 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">
              Known limitations
            </div>
            <p className="mb-3 text-base leading-[1.6] text-text">
              The tactics prose above mislabels both teams&apos; off-ball centroids as
              &quot;on-ball&quot; — a labeling error, not a data error; the underlying coordinates
              are correct. It&apos;s still there because the one verification pass was a targeted
              re-check against a previously known issue, not a fresh, full claim-by-claim trace of
              the current text.
            </p>
            <p className="text-base leading-[1.6] text-text">
              More broadly: this was checked once, by hand, on one match. There&apos;s no
              automated evaluation yet — that&apos;s planned, not built — so a new match, or a
              re-run of this one, could reintroduce issues this pass happened to catch. And
              nothing here regenerates live: this page and the dashboard both read the same
              static file, generated once, not on demand.
            </p>
          </section>

          <section>
            <div className="mb-2.5 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">
              What&apos;s next
            </div>
            <p className="text-base leading-[1.6] text-text">
              A second AI-engineering feature here, and an automated check to replace the
              one-time manual trace.
            </p>
          </section>
        </div>

        <div className="mt-9">
          <StatsBombAttribution variant="row" size={16} rightNote="match 3943043 · sample dataset" />
        </div>
      </div>
    </div>
  );
}
