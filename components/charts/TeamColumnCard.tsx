"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import { FormationPanel, type FormationData } from "@/components/charts/FormationPanel";
import { PassNetworkPanel, type PassNetworkData } from "@/components/charts/PassNetworkPanel";
import { TeamShapePanel, type TeamShapeData } from "@/components/charts/TeamShapePanel";
import { ShotMapPanel, type Shot } from "@/components/charts/ShotMapPanel";
import { kitEncoding, kitChip } from "@/lib/kits";
import type { Side } from "@/lib/componentLibraryData";

type View = "formation" | "passnetwork" | "teamshape";

export function TeamColumnCard({
  teamName,
  side,
  formation,
  passNetwork,
  teamShape,
  shots,
  upperHeight = 226,
  shotScale = 1,
  defaultView = "formation",
}: {
  teamName: string;
  /** Which side this column represents — the ONE source its color derives from
   * (lib/kits.ts's kitEncoding), never a hard-coded focal/secondary (Ticket 2b/2c). */
  side: Side;
  formation: FormationData;
  passNetwork: PassNetworkData;
  teamShape: TeamShapeData;
  shots: Shot[];
  upperHeight?: number;
  shotScale?: number;
  defaultView?: View;
}) {
  const [view, setView] = useState<View>(defaultView);
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const color = kitEncoding(side, mode);
  const chip = kitChip(side);

  return (
    <div
      data-testid={`team-column-${side}`}
      className="flex flex-col rounded-[14px] border border-border bg-surface p-5"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div>
          <div className="flex items-center gap-1.5">
            {/* Two-tone kit chip (Ticket 2d) — carries the team's FULL identity
                (primary + accent), decoupled from the single-hue `color` used in
                the data marks below. This is what makes England legible even
                though its primary (white) is unusable as ink: a white swatch with
                a visible navy accent border, distinguishable without relying on
                the data-mark hue alone. */}
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-[3px]"
              style={{ background: chip.primary, border: `1.5px solid ${chip.accent}` }}
            />
            <div className="font-mono text-mono-sm tracking-[0.1em] uppercase" style={{ color }}>
              {teamName}
            </div>
          </div>
          <div className="display mt-0.5 text-display-4 font-semibold">In possession</div>
        </div>
        <ToggleGroup
          options={[
            { value: "formation", label: "Formation" },
            { value: "passnetwork", label: "Pass Net" },
            { value: "teamshape", label: "Shape" },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      <div
        style={{ "--upper-h": `${upperHeight}px` } as React.CSSProperties}
        className="flex flex-col justify-center overflow-hidden dash:h-[var(--upper-h)]"
      >
        <div className={view === "formation" ? "" : "hidden"}>
          <FormationPanel data={formation} color={color} />
        </div>
        <div className={view === "passnetwork" ? "" : "hidden"}>
          <PassNetworkPanel data={passNetwork} color={color} />
        </div>
        <div className={view === "teamshape" ? "" : "hidden"}>
          <TeamShapePanel data={teamShape} color={color} hideControls />
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3.5">
        <div className="mb-2 font-mono text-mono-sm tracking-[0.1em] text-faint uppercase">
          Shot map · xG
        </div>
        <ShotMapPanel shots={shots} color={color} shotScale={shotScale} />
      </div>
    </div>
  );
}
