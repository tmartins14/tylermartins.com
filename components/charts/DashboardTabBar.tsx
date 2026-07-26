"use client";

import { cn } from "@/lib/utils";

type TabColor = "focal" | "secondary" | "text";

type TabOption<T extends string> = {
  value: T;
  label: string;
  colorToken: TabColor;
};

const tint: Record<TabColor, string> = {
  focal: "border-focal bg-focal-soft text-focal",
  secondary: "border-secondary bg-secondary-soft text-secondary",
  text: "border-text bg-text/10 text-text",
};

/** Top-level mobile page navigation between the Spain / Match / England panels — distinct from
 * ToggleGroup, which switches views within a single panel. */
export function DashboardTabBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="tablist" className="grid grid-cols-3 gap-[6px]">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-11 rounded-[6px] border font-mono text-[11px] font-medium tracking-[0.08em] uppercase",
              active ? tint[opt.colorToken] : "border-border text-muted"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
