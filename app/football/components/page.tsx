import { components } from "@/lib/components";
import { ComponentCard } from "@/components/showcase/ComponentCard";
import { StatsBombAttribution } from "@/components/StatsBombAttribution";

export default function ComponentShowcase() {
  return (
    <div className="px-9 pt-14 pb-10">
      <div className="mb-9 max-w-[60ch]">
        <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">
          Football · component library
        </div>
        <h1 className="display mb-4 text-[44px] leading-[1.03]">footballd3 components</h1>
        <p className="text-base leading-[1.6] text-muted">
          Sixteen d3 charts, each rendered with a small, committed sample dataset —
          self-contained and reproducible. Preview, one-line description, and usage snippet.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
        {components.map((entry) => (
          <ComponentCard key={entry.name} entry={entry} />
        ))}
      </div>

      <div className="mt-8">
        <StatsBombAttribution variant="chip" size={16} />
      </div>
    </div>
  );
}
