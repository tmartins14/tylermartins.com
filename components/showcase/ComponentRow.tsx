"use client";

import dynamic from "next/dynamic";
import type { ComponentEntry } from "@/lib/components";
import type { Side } from "@/lib/componentLibraryData";

// footballd3's timelineStrip/progressiveMap/eventScatter/xtSurface modules touch
// `document` at import time (a module-level tooltip element), which crashes
// Next.js's server render — defer the whole render tree to the client.
const ComponentThumbnail = dynamic(
  () => import("@/components/showcase/ComponentThumbnail").then((m) => m.ComponentThumbnail),
  { ssr: false }
);

export function ComponentRow({
  entry,
  side,
  onOpen,
}: {
  entry: ComponentEntry;
  side: Side;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full grid-cols-1 items-center gap-2 border-t border-border px-2 py-3 text-left transition-colors hover:bg-elevated sm:grid-cols-[170px_88px_1fr_132px] sm:items-center sm:gap-4"
    >
      <span className="order-1 font-mono text-[13.5px] font-semibold text-text sm:order-1">
        {entry.name}
      </span>
      <span className="order-2 font-mono text-[10px] tracking-[0.06em] text-focal uppercase sm:order-2">
        {entry.cat}
      </span>
      <span className="order-3 line-clamp-2 text-[12px] leading-[1.45] text-muted sm:order-3">
        {entry.blurb}
      </span>
      <span className="order-4 flex h-[74px] w-[132px] items-center justify-center overflow-hidden rounded-[7px] border border-border bg-elevated sm:order-4 sm:justify-self-end">
        <ComponentThumbnail name={entry.name} side={side} />
      </span>
    </button>
  );
}
