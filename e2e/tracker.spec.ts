import { test, expect } from "@playwright/test";

test.describe("Tracker Features", () => {
  test.describe("Hydration Tracker", () => {
    test("can add and remove glasses of water", async ({ page }) => {
      await page.goto("/tracker/hydration");

      // Initial state should be 0
      await expect(page.locator("text=of 8 glasses")).toBeVisible();

      // Click + button to add a glass
      await page.click('button:has-text("+")');
      await expect(page.locator("text=1").first()).toBeVisible();

      // Click + again
      await page.click('button:has-text("+")');

      // Click - to remove one
      await page.click('button:has-text("-")');
    });

    test("displays hydration options", async ({ page }) => {
      await page.goto("/tracker/hydration");
      await expect(page.locator("text=Recommended Drinks")).toBeVisible();
      await expect(page.getByText("Water", { exact: true })).toBeVisible();
    });
  });

  test.describe("Quran Tracker", () => {
    test("displays 30 juz buttons", async ({ page }) => {
      await page.goto("/tracker/quran");
      await expect(page.locator("h1")).toContainText("Qur'an");

      // Should have 30 juz buttons
      const juzButtons = page.locator('button:has-text("Juz")');
      await expect(juzButtons.first()).toBeVisible();
    });

    test("can toggle juz completion", async ({ page }) => {
      await page.goto("/tracker/quran");

      // Click on first juz button
      const firstJuz = page.locator("button").filter({ hasText: "1" }).first();
      await firstJuz.click();
    });
  });

  test.describe("Schedule Tracker", () => {
    test("displays radial clock and schedule", async ({ page }) => {
      await page.goto("/tracker/schedule");
      await expect(page.locator("h1")).toContainText("Daily Schedule");
      await expect(page.locator("text=Full Schedule")).toBeVisible();
    });
  });

  test.describe("Nutrition Tracker", () => {
    test("displays balanced plate chart", async ({ page }) => {
      await page.goto("/tracker/nutrition");
      await expect(page.locator("h1")).toContainText("Nutrition");
      await expect(
        page.locator("text=Balance your plate")
      ).toBeVisible();
    });

    test("shows sahoor and iftar foods", async ({ page }) => {
      await page.goto("/tracker/nutrition");
      await expect(page.locator("text=Sahoor")).toBeVisible();
      await expect(page.locator("text=Iftar")).toBeVisible();
    });
  });
});
