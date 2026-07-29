import { CATEGORY_LABELS, type ComponentCategory, type ComponentEntry } from "@/lib/components";
import { ComponentRow } from "@/components/showcase/ComponentRow";
import type { Side } from "@/lib/componentLibraryData";

export function CategorySection({
  category,
  entries,
  side,
  onOpen,
}: {
  category: ComponentCategory;
  entries: ComponentEntry[];
  side: Side;
  onOpen: (entry: ComponentEntry) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-[0.12em] text-focal uppercase">
          {CATEGORY_LABELS[category]}
        </span>
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] text-faint">{entries.length}</span>
      </div>
      <div>
        {entries.map((entry) => (
          <ComponentRow key={entry.name} entry={entry} side={side} onOpen={() => onOpen(entry)} />
        ))}
      </div>
    </section>
  );
}
