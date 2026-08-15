import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChartFrameProps = {
  kicker: string;
  /** Defaults to `muted` — the color law (see DESIGN.md § Color law): in a chart
   * that encodes real data, the kicker stays muted, never brand-tinted. `focal`/
   * `secondary` are reserved for non-data framing only (e.g. a purely editorial
   * card with no data marks to conflict with). Audited (Ticket 2g): nothing in
   * this codebase currently opts into either — if a future caller does, it
   * should be a deliberate non-data case, not an accidental leak. */
  kickerColor?: "focal" | "secondary" | "muted";
  title?: string;
  wide?: boolean;
  right?: ReactNode;
  children: ReactNode;
};

const KICKER_COLOR: Record<NonNullable<ChartFrameProps["kickerColor"]>, string> = {
  focal: "text-focal",
  secondary: "text-secondary",
  muted: "text-muted",
};

export function ChartFrame({
  kicker,
  kickerColor = "muted",
  title,
  wide = false,
  right,
  children,
}: ChartFrameProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 md:px-6",
        wide && "col-span-full"
      )}
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div
            className={cn(
              "font-mono text-mono-sm tracking-[0.1em] uppercase",
              KICKER_COLOR[kickerColor]
            )}
          >
            {kicker}
          </div>
          {title ? (
            <div className="mt-0.5 font-display text-display-4 font-semibold">{title}</div>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
