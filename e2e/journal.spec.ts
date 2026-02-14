import { test, expect } from "@playwright/test";

test.describe("Daily Journal", () => {
  test("journal page loads at /tracker/journal", async ({ page }) => {
    await page.goto("/tracker/journal");
    await expect(page).toHaveURL("/tracker/journal");
  });

  test("journal has text input area", async ({ page }) => {
    await page.goto("/tracker/journal");
    // Journal should have a textarea or input for writing
    const textArea = page.locator("textarea").first();
    const input = page.locator('input[type="text"]').first();

    const hasTextArea = await textArea.isVisible().catch(() => false);
    const hasInput = await input.isVisible().catch(() => false);
    expect(hasTextArea || hasInput).toBeTruthy();
  });
});
