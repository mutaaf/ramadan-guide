import { test, expect } from "@playwright/test";

test.describe("Accountability Partner", () => {
  test("partner page loads at /partner", async ({ page }) => {
    await page.goto("/partner");
    await expect(page).toHaveURL("/partner");
  });

  test("connect page loads at /partner/connect", async ({ page }) => {
    await page.goto("/partner/connect");
    await expect(page).toHaveURL("/partner/connect");
  });

  test("shows partner code generation UI", async ({ page }) => {
    await page.goto("/partner/connect");
    // Should show options to generate or enter a code
    const generateBtn = page.locator("button:has-text('Generate'), button:has-text('Get'), button:has-text('Create')").first();
    const enterInput = page.locator("input[placeholder*='code'], input[placeholder*='Code'], input[placeholder*='partner']").first();

    // At least one of these should be visible
    const hasGenerate = await generateBtn.isVisible().catch(() => false);
    const hasInput = await enterInput.isVisible().catch(() => false);
    expect(hasGenerate || hasInput).toBeTruthy();
  });
});
