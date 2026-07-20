"use client";

import { useState } from "react";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import { FormationPanel, type FormationData } from "@/components/charts/FormationPanel";
import { PassNetworkPanel, type PassNetworkData } from "@/components/charts/PassNetworkPanel";
import { TeamShapePanel, type TeamShapeData } from "@/components/charts/TeamShapePanel";
import { ShotMapPanel, type Shot } from "@/components/charts/ShotMapPanel";

type View = "formation" | "passnetwork" | "teamshape";

export function TeamColumnCard({
  teamName,
  colorToken,
  formation,
  passNetwork,
  teamShape,
  shots,
  upperHeight = 226,
  shotScale = 1,
  defaultView = "formation",
}: {
  teamName: string;
  colorToken: "focal" | "secondary";
  formation: FormationData;
  passNetwork: PassNetworkData;
  teamShape: TeamShapeData;
  shots: Shot[];
  upperHeight?: number;
  shotScale?: number;
  defaultView?: View;
}) {
  const [view, setView] = useState<View>(defaultView);

  return (
    <div className="flex flex-col rounded-[14px] border border-border bg-surface p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div
            className={`font-mono text-[11px] tracking-[0.1em] uppercase ${
              colorToken === "focal" ? "text-focal" : "text-secondary"
            }`}
          >
            {teamName}
          </div>
          <div className="display mt-0.5 text-[19px] font-semibold">In possession</div>
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

      <div style={{ height: upperHeight, overflow: "hidden" }} className="flex flex-col justify-center">
        <div className={view === "formation" ? "" : "hidden"}>
          <FormationPanel data={formation} colorToken={colorToken} />
        </div>
        <div className={view === "passnetwork" ? "" : "hidden"}>
          <PassNetworkPanel data={passNetwork} colorToken={colorToken} />
        </div>
        <div className={view === "teamshape" ? "" : "hidden"}>
          <TeamShapePanel data={teamShape} colorToken={colorToken} hideControls />
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3.5">
        <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
          Shot map · xG
        </div>
        <ShotMapPanel shots={shots} colorToken={colorToken} shotScale={shotScale} />
      </div>
    </div>
  );
}
