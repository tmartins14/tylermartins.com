"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { createActionFeed, classifyLayer } from "footballd3/actionFeed";
import { ToggleGroup } from "@/components/charts/ToggleGroup";
import type { PlayerEvent } from "@/lib/playerEvents";

type SortBy = "minute" | "xt";
type SortDir = "asc" | "desc";

type ActionFeedPanelProps = {
  /** Scrub-filtered player events (minute <= scrubbedMinute) — NOT yet layer-filtered, this panel does that itself via activeLayers. */
  events: PlayerEvent[];
  /** The layer-toggle chip bar's current selection (owned by TerritoryPanel/the page, shared so both panels filter identically). */
  activeLayers: Set<string>;
  hoveredEventId: string | null;
  onHoverEvent: (eventId: string | null) => void;
};

export function ActionFeedPanel({ events, activeLayers, hoveredEventId, onHoverEvent }: ActionFeedPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("minute");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const onHoverEventRef = useRef(onHoverEvent);
  useEffect(() => {
    onHoverEventRef.current = onHoverEvent;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    const visible = events.filter((e) => activeLayers.has(classifyLayer(e)));
    createActionFeed(
      container$,
      { events: visible },
      {
        height: 280,
        sortBy,
        sortDir,
        highlightEventId: hoveredEventId,
        onHoverRow: (eventId: string | null) => onHoverEventRef.current(eventId),
      }
    );

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, activeLayers, sortBy, sortDir, hoveredEventId]);

  return (
    <div data-testid="action-feed-panel">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <ToggleGroup
          options={[
            { value: "minute", label: "Minute" },
            { value: "xt", label: "xT" },
          ]}
          value={sortBy}
          onChange={setSortBy}
        />
        <ToggleGroup
          options={[
            { value: "asc", label: "Asc" },
            { value: "desc", label: "Desc" },
          ]}
          value={sortDir}
          onChange={setSortDir}
        />
      </div>
      <div ref={containerRef} className="rounded-lg border border-border" />
    </div>
  );
}
