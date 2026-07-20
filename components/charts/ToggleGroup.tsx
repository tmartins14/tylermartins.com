"use client";

import { cn } from "@/lib/utils";

type ToggleOption<T extends string> = {
  value: T;
  label: string;
};

type ToggleGroupProps<T extends string> = {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Connected segmented control — one active view among several, not page navigation. */
export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  className,
}: ToggleGroupProps<T>) {
  return (
    <div className={cn("inline-flex", className)}>
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "relative border border-border px-2.5 py-[3px] font-mono text-[11px] font-medium whitespace-nowrap",
            i > 0 && "-ml-px",
            i === 0 && "rounded-l-[3px]",
            i === options.length - 1 && "rounded-r-[3px]",
            opt.value === value
              ? "z-10 border-focal bg-focal-soft text-focal"
              : "text-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
