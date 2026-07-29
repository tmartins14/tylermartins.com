"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentEntry } from "@/lib/components";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import { getSampleRows, TEAM_NAME, type Side } from "@/lib/componentLibraryData";

// See ComponentRow.tsx — footballd3's timelineStrip/progressiveMap/eventScatter/
// xtSurface modules touch `document` at import time, which crashes SSR.
const ComponentStage = dynamic(
  () => import("@/components/showcase/ComponentStage").then((m) => m.ComponentStage),
  { ssr: false }
);

export function ComponentModal({
  entry,
  side,
  onSideChange,
  mode,
  onModeChange,
  orientationMode,
  onOrientationModeChange,
  onClose,
}: {
  entry: ComponentEntry | null;
  side: Side;
  onSideChange: (side: Side) => void;
  mode: string;
  onModeChange: (name: string, mode: string) => void;
  orientationMode: string;
  onOrientationModeChange: (name: string, mode: string) => void;
  onClose: () => void;
}) {
  // Keep rendering the last-open entry's content while Base UI runs the close
  // transition — gating on `entry` directly would unmount the Popup's children
  // the instant it goes null, fighting the exit animation and leaving the
  // backdrop stuck mid-transition (still intercepting pointer events).
  const [lastEntry, setLastEntry] = useState<ComponentEntry | null>(null);
  if (entry && entry !== lastEntry) setLastEntry(entry);

  return (
    <Dialog.Root
      open={entry != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[rgba(23,20,15,0.55)] backdrop-blur-[3px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        {lastEntry ? (
          <Dialog.Popup className="fixed inset-6 z-50 m-auto flex h-fit max-h-[88vh] w-[min(1040px,92vw)] flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface text-text shadow-[0_50px_120px_-40px_rgba(0,0,0,0.6)] outline-none transition-all duration-[280ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] data-[ending-style]:translate-y-2.5 data-[ending-style]:scale-[0.965] data-[ending-style]:opacity-0 data-[starting-style]:translate-y-2.5 data-[starting-style]:scale-[0.965] data-[starting-style]:opacity-0"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="rounded-[5px] border border-focal px-2 py-0.5 font-mono text-[11px] text-focal uppercase">
                  {lastEntry.cat}
                </span>
                <Dialog.Title className="font-display text-[22px] font-semibold text-text">
                  {lastEntry.name}
                </Dialog.Title>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden font-mono text-[11px] text-faint sm:inline">
                  Euro 2024 Final · 3943043
                </span>
                <Dialog.Close
                  aria-label="Close"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto sm:flex-row sm:overflow-hidden">
              <div className="flex flex-1 items-center justify-center overflow-auto bg-background px-5 py-6 sm:px-7">
                <ComponentStage entry={lastEntry} side={side} mode={mode} orientationMode={orientationMode} />
              </div>
              <div className="flex w-full flex-col gap-5 overflow-y-auto border-t border-border p-[22px] sm:w-[300px] sm:shrink-0 sm:border-t-0 sm:border-l">
                <div>
                  <div className="mb-1.5 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
                    About
                  </div>
                  <p className="text-[13px] leading-[1.6] text-muted">{lastEntry.blurb}</p>
                </div>

                {lastEntry.teamAware || lastEntry.modes || lastEntry.orientationModes ? (
                  <div>
                    <div className="mb-1.5 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
                      Controls
                    </div>
                    <div className="flex flex-col gap-2">
                      {lastEntry.teamAware ? (
                        <ToggleGroup
                          options={[
                            { value: "home", label: TEAM_NAME.home },
                            { value: "away", label: TEAM_NAME.away },
                          ]}
                          value={side}
                          onChange={onSideChange}
                        />
                      ) : null}
                      {lastEntry.modes ? (
                        <ToggleGroup
                          options={lastEntry.modes}
                          value={mode}
                          onChange={(v) => onModeChange(lastEntry.name, v)}
                        />
                      ) : null}
                      {lastEntry.orientationModes ? (
                        <ToggleGroup
                          options={lastEntry.orientationModes}
                          value={orientationMode}
                          onChange={(v) => onOrientationModeChange(lastEntry.name, v)}
                        />
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div>
                  <div className="mb-1.5 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
                    API
                  </div>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-elevated px-3 py-2.5 font-mono text-[11.5px] leading-[1.5] text-text">
                    {lastEntry.code}
                  </pre>
                </div>

                {lastEntry.sample.length > 0 ? (
                  <div>
                    <div className="mb-1.5 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
                      Sample data
                    </div>
                    <pre className="max-h-[150px] overflow-auto rounded-lg border border-border bg-elevated px-3 py-2.5 font-mono text-[10.5px] leading-[1.5] text-muted">
                      {JSON.stringify(getSampleRows(lastEntry.name, side), null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </div>
          </Dialog.Popup>
        ) : null}
      </Dialog.Portal>
    </Dialog.Root>
  );
}
