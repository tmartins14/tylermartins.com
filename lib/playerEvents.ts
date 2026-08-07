/**
 * Shared type for player_events/{match_id}/{player_id}.json (from
 * extract_player_events.py) — every panel on the Player Match Analysis page
 * reads a scrub-filtered slice of the same player's event array, so the
 * shape is defined once here rather than duplicated per panel.
 */
export type PlayerEvent = {
  event_id: string;
  minute: number;
  second: number;
  type: string;
  location: [number, number];
  end_location: [number, number] | null;
  outcome: string | null;
  under_pressure: boolean;
  possession: number;
  possession_team: string;
  duel_type: string | null;
  is_progressive: boolean | null;
  xt_delta: number | null;
  distance_gained: number | null;
  pressure_regain: boolean | null;
  shot_xg: number | null;
  shot_end_location: number[] | null;
  is_goal: boolean | null;
  key_pass: boolean | null;
  assisted_shot_xg: number | null;
  possession_shot_xg: number;
};

export type PlayerEventsFile = {
  events: PlayerEvent[];
  metadata: {
    match_id: number;
    player_id: number;
    display_name: string;
    team: string;
    competition: string;
    season: string;
    match_label: string;
    n_events: number;
    xt_grid_source: string;
    progressive_threshold: number;
    pressure_regain_window_seconds: number;
  };
};

/** events with minute <= scrubbedMinute — the one filter every panel applies. */
export function scrubFilter(events: PlayerEvent[], scrubbedMinute: number): PlayerEvent[] {
  return events.filter((e) => e.minute <= scrubbedMinute);
}
