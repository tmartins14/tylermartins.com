"use client";

import { useState } from "react";
import { CATEGORY_ORDER, components, type ComponentEntry } from "@/lib/components";
import { CategorySection } from "@/components/showcase/CategorySection";
import { ComponentModal } from "@/components/showcase/ComponentModal";
import { matchStatsData, TEAM_NAME, type Side } from "@/lib/componentLibraryData";
import { StatsBombAttribution } from "@/components/StatsBombAttribution";

export default function ComponentShowcase() {
  const [side, setSide] = useState<Side>("home");
  const [view, setView] = useState<Record<string, string>>({});
  const [orientationView, setOrientationView] = useState<Record<string, string>>({});
  const [openName, setOpenName] = useState<string | null>(null);

  const openEntry: ComponentEntry | null = components.find((c) => c.name === openName) ?? null;
  const mode = openEntry ? (view[openEntry.name] ?? openEntry.defaultMode ?? "") : "";
  const orientationMode = openEntry
    ? (orientationView[openEntry.name] ?? openEntry.defaultOrientationMode ?? "")
    : "";

  return (
    <div className="px-9 pt-14 pb-10">
      <div className="mb-7 max-w-[82ch]">
        <div className="mb-4 font-mono text-xs tracking-[0.14em] text-focal uppercase">
          footballd3 · component library
        </div>
        <h1 className="display mb-4 text-[34px] leading-[1.05]">Explore the library</h1>
        <p className="text-[13.5px] leading-[1.6] text-muted">
          Sixteen d3 charts, each rendered live on the{" "}
          <strong className="font-semibold text-text">
            UEFA Euro 2024 Final ({TEAM_NAME.home} {matchStatsData.home.score}–
            {matchStatsData.away.score} {TEAM_NAME.away})
          </strong>
          , StatsBomb match 3943043. Pick a component to inspect it full-size, with live controls,
          its API, and a peek at the data feeding it.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-strong bg-background px-5 pt-5 pb-2 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col gap-6">
          {CATEGORY_ORDER.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              entries={components.filter((c) => c.cat === cat)}
              side={side}
              onOpen={(entry) => setOpenName(entry.name)}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <StatsBombAttribution variant="chip" size={16} />
      </div>

      <ComponentModal
        entry={openEntry}
        side={side}
        onSideChange={setSide}
        mode={mode}
        onModeChange={(name, m) => setView((v) => ({ ...v, [name]: m }))}
        orientationMode={orientationMode}
        onOrientationModeChange={(name, m) => setOrientationView((v) => ({ ...v, [name]: m }))}
        onClose={() => setOpenName(null)}
      />
    </div>
  );
}
