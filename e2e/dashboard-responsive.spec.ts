import { test, expect, type Page, type Locator } from "@playwright/test";

const VIEWPORTS = [
  { name: "phone", width: 375, height: 812, layout: "tabs" as const },
  { name: "tablet", width: 768, height: 1024, layout: "tabs" as const },
  // 1536px, not 1280: the site rail (w-60 = 240px, lg:1024+) eats into the viewport once it
  // appears, and the clamp cap (pxPerYard 3.2 / ~304px pitch width) isn't actually reached
  // until the remaining content width is this wide — verified empirically.
  { name: "desktop", width: 1536, height: 900, layout: "grid" as const },
];

const TEAM_VIEWS = ["Formation", "Pass Net", "Shape"];
const CENTER_VIEWS = ["Stats", "Momentum", "Goals"];

/** No horizontal scroll, and every visible pitch SVG stays within its parent card. */
async function assertNoOverflowOrClipping(page: Page, card: Locator, viewportWidth: number) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const cardBox = await card.boundingBox();
  if (!cardBox) return;

  const svgs = card.locator("svg");
  const count = await svgs.count();
  for (let i = 0; i < count; i++) {
    const svg = svgs.nth(i);
    if (!(await svg.isVisible())) continue;
    const box = await svg.boundingBox();
    if (!box) continue;
    expect(box.x, `svg ${i} left edge clipped at ${viewportWidth}px`).toBeGreaterThanOrEqual(
      cardBox.x - 1
    );
    expect(
      box.x + box.width,
      `svg ${i} right edge overflows card at ${viewportWidth}px`
    ).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
  }
}

/** The desktop grid and the tabbed stack both mount every chart card (dual-render, toggled
 * via CSS) — data-testids are duplicated in the DOM, so every lookup must be scoped to
 * whichever container is actually visible at this viewport. */
function scopeFor(page: Page, layout: "tabs" | "grid") {
  return layout === "grid"
    ? page.getByTestId("dashboard-grid")
    : page.getByTestId("mobile-dashboard-tabs");
}

for (const viewport of VIEWPORTS) {
  test.describe(`dashboard @ ${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("shows the tab bar below 720px and the 3-column grid at/above it", async ({ page }) => {
      await page.goto("/football/dashboard");
      const tablist = page.getByRole("tablist");
      const grid = page.getByTestId("dashboard-grid");

      if (viewport.layout === "tabs") {
        await expect(tablist).toBeVisible();
        await expect(grid).toBeHidden();
      } else {
        await expect(tablist).toBeHidden();
        await expect(grid).toBeVisible();
      }
    });

    test("no horizontal overflow and no clipped pitch panels across every view", async ({
      page,
    }) => {
      await page.goto("/football/dashboard");
      const scope = scopeFor(page, viewport.layout);

      for (const [tabName, testId] of [
        ["Spain", "team-column-focal"],
        ["England", "team-column-secondary"],
      ] as const) {
        if (viewport.layout === "tabs") {
          await page.getByRole("tab", { name: tabName }).click();
        }
        const card = scope.getByTestId(testId);
        await expect(card).toBeVisible();
        for (const label of TEAM_VIEWS) {
          await card.getByRole("button", { name: label, exact: true }).click();
          await assertNoOverflowOrClipping(page, card, viewport.width);
        }
      }

      if (viewport.layout === "tabs") {
        await page.getByRole("tab", { name: "Match" }).click();
      }
      const center = scope.getByTestId("center-column");
      await expect(center).toBeVisible();
      for (const label of CENTER_VIEWS) {
        await center.getByRole("button", { name: label, exact: true }).click();
        await assertNoOverflowOrClipping(page, center, viewport.width);
      }
    });

    if (viewport.layout === "tabs") {
      test("tab bar shows exactly one column panel at a time", async ({ page }) => {
        await page.goto("/football/dashboard");
        const scope = scopeFor(page, "tabs");
        const focal = scope.getByTestId("team-column-focal");
        const center = scope.getByTestId("center-column");
        const secondary = scope.getByTestId("team-column-secondary");

        await page.getByRole("tab", { name: "Spain" }).click();
        await expect(focal).toBeVisible();
        await expect(center).toBeHidden();
        await expect(secondary).toBeHidden();

        await page.getByRole("tab", { name: "Match" }).click();
        await expect(center).toBeVisible();
        await expect(focal).toBeHidden();
        await expect(secondary).toBeHidden();

        await page.getByRole("tab", { name: "England" }).click();
        await expect(secondary).toBeVisible();
        await expect(focal).toBeHidden();
        await expect(center).toBeHidden();
      });

      test("Momentum view actually renders bars, not just an empty container", async ({
        page,
      }) => {
        // Regression guard: MomentumBarPanel needs a real measured container height to
        // render (unlike the width-only pitch panels), and the overflow/clipping check
        // above wouldn't have caught a silently empty chart — only overflow.
        await page.goto("/football/dashboard");
        const scope = scopeFor(page, "tabs");
        await page.getByRole("tab", { name: "Match" }).click();
        await scope
          .getByTestId("center-column")
          .getByRole("button", { name: "Momentum", exact: true })
          .click();

        const bars = scope.getByTestId("center-column").locator("svg rect");
        await expect(bars.first()).toBeVisible();
        expect(await bars.count()).toBeGreaterThan(0);
      });

      test("sticky header stays pinned in place while scrolling", async ({ page }) => {
        await page.goto("/football/dashboard");
        const header = page.getByTestId("mobile-match-header");

        // Scroll enough to pass the sticky threshold, then confirm it holds its position
        // under further scrolling instead of drifting or scrolling away.
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(150);
        const stuckY = (await header.boundingBox())?.y;
        expect(stuckY).not.toBeNull();

        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(150);
        const afterMoreScroll = (await header.boundingBox())?.y;

        expect(afterMoreScroll).toBe(stuckY);
      });
    }

    if (viewport.layout === "grid") {
      test("desktop pitch panels render near the original 304px width (clamp cap reached)", async ({
        page,
      }) => {
        await page.goto("/football/dashboard");
        const grid = page.getByTestId("dashboard-grid");

        // Allow a few px of tolerance for grid-track subpixel rounding — the point
        // is confirming the clamp cap (3.2 pxPerYard) is reached, not pixel-exactness.
        const expectWidthNear304 = async (svg: Locator) => {
          const width = parseFloat((await svg.getAttribute("width")) ?? "0");
          expect(width).toBeGreaterThanOrEqual(298);
          expect(width).toBeLessThanOrEqual(304);
        };

        await expectWidthNear304(
          grid.getByTestId("team-column-focal").getByTestId("shot-map-panel").locator("svg")
        );
        await expectWidthNear304(
          grid.getByTestId("team-column-secondary").getByTestId("pass-network-panel").locator("svg")
        );
      });
    }
  });
}
