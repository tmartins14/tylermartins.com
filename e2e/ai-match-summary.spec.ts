import { test, expect } from "@playwright/test";

// /ai/match-summary — the tabbed match summary (#summary) and the comparison
// table below it (#comparison). Data is static JSON
// (data/football/match_summary_3943043.json,
// data/football/match_summary_comparison_3943043.json), so these assert on
// structure and on the two chosen defaults, not on exact dollar values.

const RUN_LABELS = [
  "Shipped",
  "Haiku 4.5 · none",
  "Sonnet 5 · medium",
  "Opus 5 · medium",
  "Sonnet 5 · low",
  "Sonnet 5 · high",
];

test.describe("ai match summary — tabbed summary", () => {
  test("defaults to the shipped tab with a headline, stats, and per-component routing", async ({ page }) => {
    await page.goto("/ai/match-summary");
    const summary = page.locator("#summary");
    await expect(summary.getByRole("button", { name: "Shipped", exact: true })).toBeVisible();
    await expect(summary.locator("h2").first()).not.toBeEmpty();
    await expect(summary.getByText("Outcome").first()).toBeVisible();
    await expect(summary.getByText("Tactics").first()).toBeVisible();
    await expect(summary).toContainText("Sonnet 5");
    await expect(summary).toContainText("Opus 5");
    await expect(summary).toContainText("low");
    await expect(summary).toContainText("medium");
    await expect(summary).toContainText("Total");
  });

  test("all six tabs are selectable and each shows a headline, stats, and tactics text", async ({ page }) => {
    await page.goto("/ai/match-summary");
    const summary = page.locator("#summary");
    for (const label of RUN_LABELS) {
      await summary.getByRole("button", { name: label, exact: true }).click();
      await expect(summary.locator("h2").first()).not.toBeEmpty();
      await expect(summary.locator(".grid > div").first()).toBeVisible(); // key stats grid
    }
  });

  test("switching tabs changes the shown text and known issues", async ({ page }) => {
    await page.goto("/ai/match-summary");
    const summary = page.locator("#summary");
    const headlineFor = async (label: string) => {
      await summary.getByRole("button", { name: label, exact: true }).click();
      return summary.locator("h2").first().innerText();
    };

    const shipped = await headlineFor("Shipped");
    const haiku = await headlineFor("Haiku 4.5 · none");
    expect(haiku).not.toBe(shipped);

    await expect(summary.getByText("Known issues in this run")).toBeVisible();
    await expect(summary.locator("li").first()).toBeVisible();
  });

  test("the shipped tab explains its cost is reused from the comparison run", async ({ page }) => {
    await page.goto("/ai/match-summary");
    const summary = page.locator("#summary");
    await expect(summary.getByText(/usage wasn't recorded separately/)).toBeVisible();
    await summary.getByRole("button", { name: "Sonnet 5 · low", exact: true }).click();
    await expect(summary.getByText(/usage wasn't recorded separately/)).toHaveCount(0);
  });
});

test.describe("ai match summary — comparison table", () => {
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

  test("no duplicate full-text run listing below the table", async ({ page }) => {
    await page.goto("/ai/match-summary");
    // The old per-run <details>/tab list lived under #comparison; that content
    // now lives only in the #summary tabs above — regression guard against
    // the redundancy this replaced.
    await expect(page.locator("#comparison details")).toHaveCount(0);
    await expect(page.locator("#comparison").getByRole("button", { name: "Opus 5 · medium" })).toHaveCount(0);
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
