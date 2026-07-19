import { cn } from "@/lib/utils";

type StatsBombAttributionProps = {
  /**
   * inline — bare swatch + text (footer).
   * chip — bordered pill on `surface` (showcase, below the grid).
   * row — full-width row with a top border and an optional right-aligned note (dashboard).
   */
  variant?: "inline" | "chip" | "row";
  /** Swatch size in px. Spec uses 14 (footer/topbar), 16 (showcase), 18 (dashboard). */
  size?: number;
  /** Right-aligned secondary note, only rendered for `variant="row"`. */
  rightNote?: string;
  className?: string;
};

/**
 * Required wherever StatsBomb data is rendered. Swatch stands in for the
 * official StatsBomb mark until that asset is sourced.
 */
export function StatsBombAttribution({
  variant = "inline",
  size = 16,
  rightNote,
  className,
}: StatsBombAttributionProps) {
  const content = (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block shrink-0 rounded-[3px] bg-focal"
        style={{ width: size, height: size }}
      />
      <span className="font-mono text-xs text-muted">
        Data provided by{" "}
        <a
          href="https://statsbomb.com"
          className="underline underline-offset-2 hover:text-focal"
        >
          StatsBomb
        </a>
      </span>
    </span>
  );

  if (variant === "chip") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2",
          className
        )}
      >
        {content}
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5",
          className
        )}
      >
        {content}
        {rightNote ? (
          <span className="font-mono text-[11px] text-faint">{rightNote}</span>
        ) : null}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}
