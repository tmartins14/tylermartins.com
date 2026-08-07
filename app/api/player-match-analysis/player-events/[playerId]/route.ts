import { readFile } from "node:fs/promises";
import path from "node:path";

// Euro 2024 Final only, for this v1 single-match page.
const MATCH_ID = "3943043";

// player_events files are fetched per-player on selection (not bundled into
// the initial page payload) — the design's own "fetched on selection, not
// loaded and filtered client-side" contract, and a real payload concern:
// bundling all ~27 players' files (plus their heatmap buckets) eagerly would
// ship several MB of JSON no single visit ever fully uses.
export async function GET(_request: Request, ctx: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await ctx.params;
  if (!/^\d+$/.test(playerId)) {
    return Response.json({ error: "invalid playerId" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "data", "football", "player_events", MATCH_ID, `${playerId}.json`);
  try {
    const text = await readFile(filePath, "utf-8");
    return new Response(text, { headers: { "content-type": "application/json" } });
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
}
