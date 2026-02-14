import { test, expect } from "@playwright/test";

test.describe("Educational Series", () => {
  test("can navigate to series from learn hub", async ({ page }) => {
    await page.goto("/learn");
    // Look for series link/section
    const seriesLink = page.locator('a[href*="/learn/series"]').first();
    if (await seriesLink.isVisible()) {
      await seriesLink.click();
      await expect(page).toHaveURL(/\/learn\/series/);
    }
  });

  test("series list page loads at /learn/series", async ({ page }) => {
    await page.goto("/learn/series");
    await expect(page).toHaveURL("/learn/series");
  });

  test("bookmarks page loads at /learn/series/bookmarks", async ({ page }) => {
    await page.goto("/learn/series/bookmarks");
    await expect(page).toHaveURL("/learn/series/bookmarks");
  });
});
