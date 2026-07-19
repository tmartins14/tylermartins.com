"use client";

import { useState } from "react";
import { ChartFrame } from "@/components/charts/ChartFrame";
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
}: {
  teamName: string;
  colorToken: "focal" | "secondary";
  formation: FormationData;
  passNetwork: PassNetworkData;
  teamShape: TeamShapeData;
  shots: Shot[];
}) {
  const [view, setView] = useState<View>("formation");

  return (
    <ChartFrame
      kicker={teamName}
      kickerColor={colorToken}
      right={
        <ToggleGroup
          options={[
            { value: "formation", label: "Formation" },
            { value: "passnetwork", label: "Pass Network" },
            { value: "teamshape", label: "Team Shape" },
          ]}
          value={view}
          onChange={setView}
        />
      }
    >
      <div className={view === "formation" ? "" : "hidden"}>
        <FormationPanel data={formation} colorToken={colorToken} />
      </div>
      <div className={view === "passnetwork" ? "" : "hidden"}>
        <PassNetworkPanel data={passNetwork} colorToken={colorToken} />
      </div>
      <div className={view === "teamshape" ? "" : "hidden"}>
        <TeamShapePanel data={teamShape} colorToken={colorToken} />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-2 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
          Shot map
        </div>
        <ShotMapPanel shots={shots} colorToken={colorToken} />
      </div>
    </ChartFrame>
  );
}
