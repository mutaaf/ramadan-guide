import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Ramadan Companion/);
    await expect(page.locator("text=Assalamu Alaikum")).toBeVisible();
  });

  test("can navigate to Learn section", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/learn"]');
    await expect(page).toHaveURL("/learn");
    await expect(page.locator("h1")).toContainText("Learn");
  });

  test("can navigate to Tracker section", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/tracker"]');
    await expect(page).toHaveURL("/tracker");
    await expect(page.locator("h1")).toContainText("Track");
  });

  test("can navigate to Dashboard", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Progress");
  });

  test("can navigate to Ask page", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/ask"]');
    await expect(page).toHaveURL("/ask");
  });

  test("can navigate to More section", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/more"]');
    await expect(page).toHaveURL("/more");
  });

  test("back navigation works", async ({ page }) => {
    await page.goto("/learn");
    await page.click('a[href="/learn/islam"]');
    await expect(page).toHaveURL("/learn/islam");
    await page.click("text=Back");
    await expect(page).toHaveURL("/learn");
  });
});
