"use client";

import { useState, type ReactNode } from "react";
import { DashboardTabBar } from "@/components/charts/DashboardTabBar";

type Tab = "home" | "match" | "away";

/** Mobile-only (<dash:720px) tabbed stack: one Spain/Match/England panel visible at a time.
 * Panels are kept mounted (toggled via `hidden`, not unmounted) so each chart's
 * useContainerWidth ResizeObserver re-measures correctly once revealed. */
export function MobileDashboardTabs({
  homeLabel,
  awayLabel,
  home,
  match,
  away,
}: {
  homeLabel: string;
  awayLabel: string;
  home: ReactNode;
  match: ReactNode;
  away: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <div data-testid="mobile-dashboard-tabs">
      <DashboardTabBar
        options={[
          { value: "home", label: homeLabel, colorToken: "focal" },
          { value: "match", label: "Match", colorToken: "text" },
          { value: "away", label: awayLabel, colorToken: "secondary" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="mt-4">
        <div className={tab === "home" ? "" : "hidden"}>{home}</div>
        <div className={tab === "match" ? "" : "hidden"}>{match}</div>
        <div className={tab === "away" ? "" : "hidden"}>{away}</div>
      </div>
    </div>
  );
}
