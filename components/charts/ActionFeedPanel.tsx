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

type ActionFeedController = { update: (next: { highlightEventId?: string | null }) => void };

export function ActionFeedPanel({ events, activeLayers, hoveredEventId, onHoverEvent }: ActionFeedPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("minute");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const onHoverEventRef = useRef(onHoverEvent);
  const ctlRef = useRef<ActionFeedController | null>(null);
  useEffect(() => {
    onHoverEventRef.current = onHoverEvent;
  });

  // Mounts only on structural changes — NOT on hoveredEventId, which changes
  // continuously while the user scrolls and hovers rows in turn. Remounting
  // on every hover would tear down and recreate the scrollable .action-feed
  // div each time, resetting its scrollTop to 0 mid-scroll. Hover updates
  // instead go through the ref-stored update() handle below.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    const visible = events.filter((e) => activeLayers.has(classifyLayer(e)));
    const ctl = createActionFeed(
      container$,
      { events: visible },
      {
        height: 240,
        sortBy,
        sortDir,
        highlightEventId: hoveredEventId,
        onHoverRow: (eventId: string | null) => onHoverEventRef.current(eventId),
      }
    );
    ctlRef.current = ctl as unknown as ActionFeedController;

    return () => {
      container$.selectAll("*").remove();
      ctlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, activeLayers, sortBy, sortDir]);

  useEffect(() => {
    ctlRef.current?.update({ highlightEventId: hoveredEventId });
  }, [hoveredEventId]);

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
