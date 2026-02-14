import { test, expect } from "@playwright/test";

test.describe("Pre-Ramadan Preparation", () => {
  test("preparation hub loads at /prepare", async ({ page }) => {
    await page.goto("/prepare");
    await expect(page).toHaveURL("/prepare");
  });

  test("checklist page loads", async ({ page }) => {
    await page.goto("/prepare/checklist");
    await expect(page).toHaveURL("/prepare/checklist");
  });

  test("duaa page loads", async ({ page }) => {
    await page.goto("/prepare/duaa");
    await expect(page).toHaveURL("/prepare/duaa");
  });

  test("communication page loads", async ({ page }) => {
    await page.goto("/prepare/communication");
    await expect(page).toHaveURL("/prepare/communication");
  });

  test("transition page loads", async ({ page }) => {
    await page.goto("/prepare/transition");
    await expect(page).toHaveURL("/prepare/transition");
  });
});
