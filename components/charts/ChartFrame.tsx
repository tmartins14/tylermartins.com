import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChartFrameProps = {
  kicker: string;
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
              "font-mono text-[11px] tracking-[0.1em] uppercase",
              KICKER_COLOR[kickerColor]
            )}
          >
            {kicker}
          </div>
          {title ? (
            <div className="mt-0.5 font-display text-[21px] font-semibold">{title}</div>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
