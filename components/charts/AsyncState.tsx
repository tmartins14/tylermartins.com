/**
 * Shared async-state kit (Ticket 4b) — one consistent loading / error / empty
 * treatment for any chart or panel fed by a client-side fetch, instead of each
 * call site inventing its own. Before this, only PlayerMatchAnalysisClient had
 * any async handling at all (plain "Loading…" text, no skeleton), and nothing
 * distinguished "fetch failed" from "fetch succeeded, this player barely
 * touched the ball" — both read as an empty popup.
 *
 * Tokens per the design spec: skeleton blocks on `surface` (not `elevated` —
 * a skeleton is a placeholder for content, one step above the page background,
 * not a raised card), error text in `muted` mono. `animate-pulse` is a stock
 * Tailwind utility; the global `prefers-reduced-motion: reduce` rule in
 * globals.css already forces every animation-duration to 1ms sitewide, so it
 * doesn't need its own reduced-motion handling here.
 */

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface ${className}`} />;
}

/**
 * Loosely mirrors PopupHeader + PopupBody's actual layout (avatar + name row,
 * a timeline-shaped bar, a stat-card grid, two chart panels) so the loading
 * state doesn't look unrelated to what's about to replace it — not a
 * pixel-exact match, just enough shape that the swap reads as "this finished
 * loading," not "the page changed."
 */
export function AsyncSkeleton() {
  return (
    <div className="p-7.5" role="status" aria-label="Loading player data">
      <div className="flex items-center gap-5">
        <SkeletonBlock className="h-[66px] w-[66px] shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-3 w-32" />
        </div>
      </div>
      <SkeletonBlock className="mt-6 h-16 w-full" />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
        <SkeletonBlock className="h-14" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
      </div>
    </div>
  );
}

/** One-line error — `muted` mono, per spec. Distinct copy from AsyncEmpty so a
 * real failure never reads as "this player just didn't do much." */
export function AsyncError({ message }: { message: string }) {
  return (
    <div className="p-10 text-center font-mono text-mono-sm text-muted" role="alert">
      {message}
    </div>
  );
}

/** Fetch succeeded but there's ~nothing to show (e.g. a substitute on for the
 * closing minutes) — same visual weight as AsyncError (a plain centered mono
 * line) but framed as a real, expected outcome, not a failure. */
export function AsyncEmpty({ message }: { message: string }) {
  return (
    <div className="p-10 text-center font-mono text-mono-sm text-muted">
      {message}
    </div>
  );
}
