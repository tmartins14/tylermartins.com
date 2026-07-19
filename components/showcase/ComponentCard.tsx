import type { ComponentEntry } from "@/lib/components";
import { ComponentPreview } from "@/components/showcase/ComponentPreview";

export function ComponentCard({ entry }: { entry: ComponentEntry }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative flex h-[168px] items-center justify-center border-b border-border bg-elevated">
        <span className="absolute top-2.5 left-3 font-mono text-[10px] text-faint">
          preview
        </span>
        <ComponentPreview cat={entry.cat} />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-[18px]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[15px] font-medium text-text">{entry.name}</span>
          <span className="font-mono text-[10px] text-faint">{entry.cat}</span>
        </div>
        <div className="flex-1 text-[13px] leading-[1.5] text-muted">{entry.blurb}</div>
        <div className="overflow-x-auto rounded-md border border-border bg-elevated px-3 py-2.5">
          <code className="whitespace-pre font-mono text-[11.5px] text-text">
            {entry.code}
          </code>
        </div>
      </div>
    </div>
  );
}
