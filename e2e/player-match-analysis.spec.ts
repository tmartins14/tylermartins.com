import { test, expect, type Page } from "@playwright/test";

/** Click a starter node in the (default-selected) Spain lineup by display name. */
async function selectSpainStarter(page: Page, displayName: string) {
  await page.locator(".fm-player", { hasText: displayName }).click();
}

async function statCardValue(page: Page, label: string) {
  const card = page.locator(".stat-card", { has: page.getByText(label, { exact: true }) });
  return card.locator(".stat-card-value").innerText();
}

test.describe("player match analysis", () => {
  test("selecting a starter loads the popup header and all six stat cards", async ({ page }) => {
    await page.goto("/football/player-match-analysis");
    await expect(page.getByText("Select a starter or substitute")).toBeVisible();

    await selectSpainStarter(page, "Lamine Yamal");

    await expect(page.getByRole("heading", { name: "Lamine Yamal" })).toBeVisible();
    await expect(page.getByText("#19 · Right Wing", { exact: true })).toBeVisible();

    for (const label of [
      "PROGRESSIVE PASSES", "xG", "xA / xG CHAIN",
      "PRESSURES + REGAINS", "PADJ DEFENSIVE ACTIONS", "DUELS WON %",
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("selecting a substitute from the bench also loads the popup", async ({ page }) => {
    await page.goto("/football/player-match-analysis");
    await page.locator(".fm-bench-row", { hasText: "Oyarzabal" }).click();
    await expect(page.getByRole("heading", { name: "Oyarzabal" })).toBeVisible();
    await expect(page.getByText("Spain · sub 67'", { exact: true })).toBeVisible();
  });

  test("close button clears the selection", async ({ page }) => {
    await page.goto("/football/player-match-analysis");
    await selectSpainStarter(page, "Lamine Yamal");
    await expect(page.getByRole("heading", { name: "Lamine Yamal" })).toBeVisible();

    await page.getByRole("button", { name: "Close player analysis" }).click();
    await expect(page.getByText("Select a starter or substitute")).toBeVisible();
  });

  test("team toggle swaps the lineup panel's formation and bench", async ({ page }) => {
    await page.goto("/football/player-match-analysis");
    await expect(page.locator(".fm-player", { hasText: "Lamine Yamal" })).toBeVisible();
    await expect(page.locator(".fm-player", { hasText: "Harry Kane" })).toHaveCount(0);

    await page.getByRole("button", { name: "England", exact: true }).click();

    await expect(page.locator(".fm-player", { hasText: "Harry Kane" })).toBeVisible();
    await expect(page.locator(".fm-player", { hasText: "Lamine Yamal" })).toHaveCount(0);
  });

  test("a player with near-zero events gets the empty-state message, not a mostly-blank popup", async ({ page }) => {
    // Ticket 4b — Ivan Toney came on at 89' and recorded exactly 1 event this
    // match (data/football/player_events/3943043/3834.json). Before the async
    // state kit, this rendered the full PopupBody with charts that had
    // essentially nothing to show, indistinguishable from a load bug.
    await page.goto("/football/player-match-analysis");
    await page.getByRole("button", { name: "England", exact: true }).click();
    await page.locator(".fm-bench-row", { hasText: "Toney" }).click();

    await expect(page.getByRole("heading", { name: "Ivan Toney" })).toBeVisible();
    await expect(page.getByText(/Ivan Toney recorded 1 action this match/)).toBeVisible();
    // The real popup header still renders (name/team/jersey) — only the body
    // is replaced by the empty-state message, not the whole popup. `uppercase`
    // is CSS-only styling; the actual text node stays mixed-case (same
    // pattern as the "Spain · sub 67'" assertion above).
    await expect(page.getByText("England · sub 89'", { exact: true })).toBeVisible();
  });

  test("scrubbing the master timeline updates the stat cards reactively", async ({ page }) => {
    await page.goto("/football/player-match-analysis");
    await selectSpainStarter(page, "Lamine Yamal");
    await expect(page.getByRole("heading", { name: "Lamine Yamal" })).toBeVisible();

    const finalXg = await statCardValue(page, "xG");
    expect(finalXg).toBe("0.33");

    const track = page.locator('[data-testid="master-scrubber-panel"] .scrub-track line');
    // Wait for a real (non-trivial) width — the scrubber's SVG mounts once
    // useContainerWidth's ResizeObserver reports a measured width, one or
    // more frames after the popup header itself is already visible.
    await expect(async () => {
      const box = await track.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThan(200);
    }).toPass();
    // Dispatched directly on the <line> rather than page.mouse.click(x, y):
    // the line renders at zero measured height (a pure horizontal stroke),
    // so a coordinate-based click is one pixel of vertical drift away from
    // missing it entirely — dispatching on the element sidesteps that.
    await track.evaluate((el) => {
      const r = el.getBoundingClientRect();
      // ~30% along the track — well before either of Lamine Yamal's shots (65', 81').
      const clientX = r.x + r.width * 0.3;
      const clientY = r.y + r.height / 2;
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX, clientY, view: window }));
    });

    await expect(async () => {
      expect(await statCardValue(page, "xG")).toBe("0.00");
    }).toPass();
  });

  test("highlight reel play resets and steps the master scrubber", async ({ page }) => {
    await page.goto("/football/player-match-analysis");
    await selectSpainStarter(page, "Lamine Yamal");
    await expect(page.getByRole("heading", { name: "Lamine Yamal" })).toBeVisible();

    await page.locator('[data-testid="highlight-reel-panel"] .reel-play').click();
    // Play jumps straight to the first standout moment's minute, then steps
    // forward — the handle readout should very quickly show a minute well
    // short of full-time (94').
    const handleLabel = page.locator('[data-testid="master-scrubber-panel"] g.scrub-handle text');
    await expect(handleLabel).not.toHaveText("94'");
  });
});

test.describe("player match analysis @ mobile (390px)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("popup becomes a full overlay over the lineup panel, closable with ✕", async ({ page }) => {
    await page.goto("/football/player-match-analysis");
    await selectSpainStarter(page, "Lamine Yamal");

    const popup = page.getByTestId("player-popup");
    await expect(popup).toBeVisible();
    await expect(popup).toHaveCSS("position", "absolute");

    const box = await popup.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(350); // spans (near) the full 390px viewport, not a narrow column

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await page.getByRole("button", { name: "Close player analysis" }).click();
    await expect(popup).toBeHidden();
    await expect(page.getByText("Select a starter or substitute")).toBeVisible();
  });

  test("stat cards go 2 columns at this width", async ({ page }) => {
    await page.goto("/football/player-match-analysis");
    await selectSpainStarter(page, "Lamine Yamal");
    await expect(page.getByRole("heading", { name: "Lamine Yamal" })).toBeVisible();

    const grid = page.locator('[data-testid="player-stat-cards-panel"] .player-stat-cards');
    await expect(grid).toHaveCSS("grid-template-columns", /^[\d.]+px [\d.]+px$/);
  });
});
