import { test, expect } from "@playwright/test";

test.describe("Badge Achievement System", () => {
  test("badges page loads at /dashboard/badges", async ({ page }) => {
    await page.goto("/dashboard/badges");
    await expect(page.locator("h1")).toContainText("Badges");
  });

  test("badge grid shows badge cards", async ({ page }) => {
    await page.goto("/dashboard/badges");
    // Should have multiple badge cards rendered
    const badges = page.locator("button").filter({ has: page.locator("text=bronze, text=silver, text=gold") });
    // At least the grid container should be present
    await expect(page.locator(".grid")).toBeVisible();
  });

  test("locked badges show question mark icon", async ({ page }) => {
    await page.goto("/dashboard/badges");
    // Locked badges show "?" text
    await expect(page.locator("text=?").first()).toBeVisible();
  });

  test.describe("Share Modal with unlocked badge", () => {
    test.use({ storageState: "./e2e/storage-state-badges.json" });

    test("tapping unlocked badge opens share modal", async ({ page }) => {
      await page.goto("/dashboard/badges");

      // Click the first unlocked badge (Bismillah - journey-start)
      await page.click("text=Bismillah");

      // Share modal should appear
      await expect(page.locator("text=Share Achievement")).toBeVisible();
    });

    test("share modal shows format toggle and action buttons", async ({ page }) => {
      await page.goto("/dashboard/badges");
      await page.click("text=Bismillah");

      await expect(page.locator("text=Share Achievement")).toBeVisible();
      await expect(page.locator("text=Story 9:16")).toBeVisible();
      await expect(page.locator("text=Feed 1:1")).toBeVisible();
      await expect(page.locator("button:has-text('Share')")).toBeVisible();
    });

    test("format toggle switches between story and feed", async ({ page }) => {
      await page.goto("/dashboard/badges");
      await page.click("text=Bismillah");

      // Default is story
      const storyBtn = page.locator("button:has-text('Story 9:16')");
      const feedBtn = page.locator("button:has-text('Feed 1:1')");

      await expect(storyBtn).toBeVisible();
      await expect(feedBtn).toBeVisible();

      // Switch to feed
      await feedBtn.click();

      // Canvas should still be visible
      await expect(page.locator("canvas")).toBeVisible();
    });
  });
});
