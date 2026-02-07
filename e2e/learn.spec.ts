import { test, expect } from "@playwright/test";

test.describe("Learn Section", () => {
  test("Learn hub page shows all topics", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.locator("text=What is Islam?")).toBeVisible();
    await expect(page.locator("text=What is Ramadan?")).toBeVisible();
    await expect(page.locator("text=Laylatul Qadr")).toBeVisible();
    await expect(page.locator("text=Prophet Muhammad")).toBeVisible();
    await expect(page.locator("text=Pronunciation")).toBeVisible();
  });

  test("Islam page shows Five Pillars", async ({ page }) => {
    await page.goto("/learn/islam");
    await expect(page.locator("h1")).toContainText("What is Islam?");
    await expect(page.locator("text=Shahada")).toBeVisible();
    await expect(page.locator("text=Salah")).toBeVisible();
    await expect(page.locator("text=Zakah")).toBeVisible();
    await expect(page.locator("text=Sawm")).toBeVisible();
    await expect(page.locator("text=Hajj")).toBeVisible();
  });

  test("Ramadan page shows themes", async ({ page }) => {
    await page.goto("/learn/ramadan");
    await expect(page.locator("h1")).toContainText("What is Ramadan?");
    await expect(page.locator("text=Fasting")).toBeVisible();
  });

  test("Laylatul Qadr page loads", async ({ page }) => {
    await page.goto("/learn/laylatul-qadr");
    await expect(page.locator("h1")).toContainText("Laylatul Qadr");
    await expect(page.locator("text=Night of Power")).toBeVisible();
  });

  test("Pronunciation guide shows terms", async ({ page }) => {
    await page.goto("/learn/pronunciation");
    await expect(page.locator("h1")).toContainText("Pronunciation");
  });
});

test.describe("Dashboard", () => {
  test("Dashboard shows progress metrics", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Progress");
    await expect(page.locator("text=Days Fasted")).toBeVisible();
    await expect(page.locator("text=Prayer Streak")).toBeVisible();
    await expect(page.locator("text=30-Day Overview")).toBeVisible();
  });

  test("Dashboard shows progress rings", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Overall Progress")).toBeVisible();
    await expect(page.locator("text=Juz")).toBeVisible();
  });
});
