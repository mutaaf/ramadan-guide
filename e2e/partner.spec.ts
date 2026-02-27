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
    // Should show the partner code and a way to enter a partner's code
    const copyCodeBtn = page.locator("button:has-text('Copy Code')");
    const connectBtn = page.locator("button:has-text('Connect')");
    const codeInput = page.locator("input[placeholder='XXXXXX']");

    // At least one of these should be visible
    const hasCopy = await copyCodeBtn.isVisible().catch(() => false);
    const hasConnect = await connectBtn.isVisible().catch(() => false);
    const hasInput = await codeInput.isVisible().catch(() => false);
    expect(hasCopy || hasConnect || hasInput).toBeTruthy();
  });
});
