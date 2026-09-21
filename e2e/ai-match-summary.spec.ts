import { test, expect } from "@playwright/test";

// /ai/match-summary — the model × effort comparison section. Data is a static
// JSON copy (data/football/match_summary_comparison_3943043.json), so these
// assert on structure and on the two chosen defaults, not on exact dollar values.

test.describe("ai match summary — model & effort comparison", () => {
  test("shows all five runs with cost, errors, and MOTM columns", async ({ page }) => {
    await page.goto("/ai/match-summary");
    const section = page.locator("#comparison");
    await expect(section.getByRole("heading", { name: "Model & effort comparison" })).toBeVisible();

    const rows = section.locator("tbody tr");
    await expect(rows).toHaveCount(5);
    for (const model of ["Haiku 4.5", "Sonnet 5", "Opus 5"]) {
      await expect(section.locator("tbody").getByText(model).first()).toBeVisible();
    }
    for (const header of ["Cost", "Time", "Outcome errors", "Tactics errors", "MOTM (Nico Williams)"]) {
      await expect(section.getByRole("columnheader", { name: header })).toBeVisible();
    }
    // Every row carries a dollar figure.
    for (const row of await rows.all()) {
      await expect(row).toContainText("$");
    }
  });

  test("marks exactly the two chosen defaults", async ({ page }) => {
    await page.goto("/ai/match-summary");
    const chosen = page.locator("#comparison tbody").getByText(/Chosen ·/);
    await expect(chosen).toHaveCount(2);
    await expect(page.locator("#comparison tbody tr", { hasText: "Chosen · Outcome" })).toContainText("Sonnet 5");
    await expect(page.locator("#comparison tbody tr", { hasText: "Chosen · Tactics" })).toContainText("Opus 5");
  });

  test("each run has an expandable list of what was wrong", async ({ page }) => {
    await page.goto("/ai/match-summary");
    const details = page.locator("#comparison details");
    await expect(details).toHaveCount(5);
    const first = details.first();
    await expect(first.locator("li").first()).toBeHidden();
    await first.locator("summary").click();
    await expect(first.locator("li").first()).toBeVisible();
    await expect(first).toContainText("Outcome");
  });

  test.describe("@ phone (390px)", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test("the wide table scrolls inside its own region, not the page", async ({ page }) => {
      await page.goto("/ai/match-summary");
      const region = page.locator("#comparison").getByRole("region", { name: /five model and effort runs/ });
      await expect(region).toBeVisible();
      const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(pageOverflow).toBeLessThanOrEqual(0);
      const regionScrolls = await region.evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(regionScrolls).toBe(true);
    });
  });
});
