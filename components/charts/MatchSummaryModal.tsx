"use client";

import { Dialog } from "@base-ui/react/dialog";
import { FileText, X } from "lucide-react";
import { MatchSummaryPanel, type MatchSummaryData } from "@/components/charts/MatchSummaryPanel";

type MatchSummaryModalProps = {
  matchSummary: MatchSummaryData;
};

// Self-contained trigger + dialog — no lifted open state needed (unlike
// ComponentModal.tsx, which is externally controlled so it can keep rendering
// the last-open gallery entry through the exit transition). Same visual
// language as ComponentModal: same backdrop, panel chrome, and close-button
// treatment, just without its sidebar/controls layout.
export function MatchSummaryModal({ matchSummary }: MatchSummaryModalProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex items-center gap-1.5 rounded-lg border border-focal bg-focal-soft px-3 py-1.5 font-mono text-mono-sm font-medium text-focal transition-colors hover:bg-focal hover:text-background">
        <FileText className="h-3.5 w-3.5" />
        Match Summary
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[rgba(23,20,15,0.55)] backdrop-blur-[3px] transition-opacity duration-[var(--motion-base)] ease-standard data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-6 z-50 m-auto flex h-fit max-h-[88vh] w-[min(720px,92vw)] flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface text-text shadow-[0_50px_120px_-40px_rgba(0,0,0,0.6)] outline-none transition-all duration-[var(--motion-base)] ease-standard data-[ending-style]:translate-y-2.5 data-[ending-style]:scale-[0.965] data-[ending-style]:opacity-0 data-[starting-style]:translate-y-2.5 data-[starting-style]:scale-[0.965] data-[starting-style]:opacity-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
            <Dialog.Title className="font-display text-display-3 font-semibold text-text">
              Match Summary
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto px-5 py-5">
            <MatchSummaryPanel data={matchSummary} />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
