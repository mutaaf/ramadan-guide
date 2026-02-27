import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("welcome page loads and can navigate to step 1", async ({ page }) => {
    await page.goto("/onboarding");
    // Feature tour starts on first slide with "Next" button
    await expect(page.locator("button:has-text('Next')")).toBeVisible();
  });

  test("step 1: enter name and select sport, then continue", async ({ page }) => {
    await page.goto("/onboarding/step-1");
    const continueBtn = page.locator("button", { hasText: "Continue" });

    // Button should be disabled initially
    await expect(continueBtn).toBeDisabled();

    // Enter name
    await page.fill('input[placeholder="Your name or nickname"]', "Khalid");

    // Select a sport
    await page.click("button:has-text('Football')");

    // Button should be enabled now
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    await expect(page).toHaveURL("/onboarding/step-2");
  });

  test("step 2: select experience levels and continue", async ({ page }) => {
    // Set up step 1 data first
    await page.goto("/onboarding/step-1");
    await page.fill('input[placeholder="Your name or nickname"]', "Khalid");
    await page.click("button:has-text('Football')");
    await page.click("button:has-text('Continue')");

    await expect(page).toHaveURL("/onboarding/step-2");
    await expect(page.locator("h1")).toContainText("Your Experience");

    // All levels have defaults, so continue should work immediately
    const continueBtn = page.locator("button", { hasText: "Continue" });
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();

    await expect(page).toHaveURL("/onboarding/step-3");
  });

  test("step 3: select goals and continue", async ({ page }) => {
    await page.goto("/onboarding/step-3");
    const continueBtn = page.locator("button", { hasText: "Continue" });

    // Button should be disabled without goals
    await expect(continueBtn).toBeDisabled();

    // Select a goal
    await page.click("button:has-text('Spiritual Growth')");

    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    await expect(page).toHaveURL("/onboarding/step-4");
  });

  test("step 4: complete onboarding redirects to home", async ({ page }) => {
    // Pre-fill earlier steps
    await page.goto("/onboarding/step-1");
    await page.fill('input[placeholder="Your name or nickname"]', "Khalid");
    await page.click("button:has-text('Football')");
    await page.click("button:has-text('Continue')");
    await page.waitForURL("/onboarding/step-2");
    await page.click("button:has-text('Continue')");
    await page.waitForURL("/onboarding/step-3");
    await page.click("button:has-text('Spiritual Growth')");
    await page.click("button:has-text('Continue')");

    await expect(page).toHaveURL("/onboarding/step-4");
    await expect(page.locator("text=MashaAllah")).toBeVisible();

    await page.click("button:has-text('Start My Journey')");
    await expect(page).toHaveURL("/");
  });

  test("continue button disabled without required fields on step 1", async ({ page }) => {
    await page.goto("/onboarding/step-1");
    const continueBtn = page.locator("button", { hasText: "Continue" });
    await expect(continueBtn).toBeDisabled();

    // Enter only name (no sport)
    await page.fill('input[placeholder="Your name or nickname"]', "Khalid");
    await expect(continueBtn).toBeDisabled();
  });
});
