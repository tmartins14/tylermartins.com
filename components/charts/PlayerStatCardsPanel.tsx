"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { createPlayerStatCards } from "footballd3/playerStatCards";
import type { PlayerEvent } from "@/lib/playerEvents";

export type PossessionShares = {
  buckets: { upto_minute: number; team_possession_pct: Record<string, number> }[];
  metadata: {
    match_id: number;
    teams: string[];
    competition: string;
    season: string;
    match_label: string;
    bucket_size_minutes: number;
    possession_share_method: string;
  };
};

type PlayerStatCardsPanelProps = {
  /** Scrub-filtered player events (minute <= scrubbedMinute). */
  events: PlayerEvent[];
  possessionShares: PossessionShares;
  playerTeam: string;
  scrubbedMinute: number;
  columns?: 2 | 3;
  onHoverLayer: (layer: string | null) => void;
};

export function PlayerStatCardsPanel({
  events,
  possessionShares,
  playerTeam,
  scrubbedMinute,
  columns = 3,
  onHoverLayer,
}: PlayerStatCardsPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onHoverLayerRef = useRef(onHoverLayer);
  useEffect(() => {
    onHoverLayerRef.current = onHoverLayer;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const container$ = d3.select(container);
    container$.selectAll("*").remove();

    const { container: cardsContainer } = createPlayerStatCards(
      container$,
      { events, possessionShares, playerTeam, scrubbedMinute },
      { onHover: (layer: string | null) => onHoverLayerRef.current(layer) }
    );
    cardsContainer.style("grid-template-columns", `repeat(${columns}, 1fr)`);

    return () => {
      container$.selectAll("*").remove();
    };
  }, [events, possessionShares, playerTeam, scrubbedMinute, columns]);

  // These are real DOM stat cards (numbers + labels), not an SVG chart — role="region"
  // groups them without hiding the individual card text from screen readers the way
  // role="img" would (that would collapse everything into one opaque description).
  return (
    <div
      ref={containerRef}
      data-testid="player-stat-cards-panel"
      role="region"
      aria-label={`${playerTeam} selected player's match contribution stats, up to the scrubbed minute`}
    />
  );
}
