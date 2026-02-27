import { test, expect } from "@playwright/test";

test.describe("iPad Landscape Responsive", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("DockNav is visible on home page", async ({ page }) => {
    await page.goto("/");
    // DockNav should be visible at md+ breakpoint
    const dockNav = page.locator("nav.dock-nav");
    await expect(dockNav).toBeVisible();
  });

  test("chat input is visible and not overlapped on /ask", async ({ page }) => {
    await page.goto("/ask");
    const input = page.locator('input[placeholder="Ask Coach Hamza..."]');
    await expect(input).toBeVisible();

    // Input should be within viewport
    const box = await input.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.y + box.height).toBeLessThanOrEqual(768);
      expect(box.y).toBeGreaterThanOrEqual(0);
    }
  });

  test.describe("during onboarding", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("DockNav is hidden during onboarding", async ({ page }) => {
      await page.goto("/onboarding");
      // DockNav should be hidden during onboarding
      const dockNav = page.locator("nav.dock-nav");
      await expect(dockNav).toBeHidden();
    });

    test("onboarding continue button visible without scrolling", async ({ page }) => {
      await page.goto("/onboarding/step-1");

      // Fill in required fields so button becomes enabled
      await page.fill('input[placeholder="Your name or nickname"]', "Test");
      await page.click("button:has-text('Football')");

      const continueBtn = page.locator("button:has-text('Continue')");
      await expect(continueBtn).toBeVisible();

      // Button should be within the viewport (no scrolling needed)
      const box = await continueBtn.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.y + box.height).toBeLessThanOrEqual(768);
      }
    });
  });
});
