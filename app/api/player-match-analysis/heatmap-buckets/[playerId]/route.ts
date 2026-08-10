import { readFile } from "node:fs/promises";
import path from "node:path";

// Euro 2024 Final only, for this v1 single-match page.
const MATCH_ID = "3943043";

// Same lazy-fetch-on-selection rationale as the player-events route — the
// heatmap_buckets files are the larger payload of the two (minute-bucketed
// KDE grids per player), so eagerly bundling all 27 would be the bigger
// waste of the two.
export async function GET(_request: Request, ctx: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await ctx.params;
  if (!/^\d+$/.test(playerId)) {
    return Response.json({ error: "invalid playerId" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "data", "football", "heatmap_buckets", MATCH_ID, `${playerId}.json`);
  try {
    const text = await readFile(filePath, "utf-8");
    return new Response(text, { headers: { "content-type": "application/json" } });
  } catch {
    return Response.json({ error: "not found" }, { status: 404 });
  }
}
