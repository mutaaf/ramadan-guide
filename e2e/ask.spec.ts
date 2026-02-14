import { test, expect } from "@playwright/test";

test.describe("Ask Coach Hamza", () => {
  test("page loads with input field visible", async ({ page }) => {
    await page.goto("/ask");
    await expect(page.locator('input[placeholder="Ask Coach Hamza..."]')).toBeVisible();
  });

  test("input accepts text", async ({ page }) => {
    await page.goto("/ask");
    const input = page.locator('input[placeholder="Ask Coach Hamza..."]');
    await input.fill("How should I train during Ramadan?");
    await expect(input).toHaveValue("How should I train during Ramadan?");
  });

  test("send button exists and is disabled when empty", async ({ page }) => {
    await page.goto("/ask");
    // The send button should be present but disabled when input is empty
    const input = page.locator('input[placeholder="Ask Coach Hamza..."]');
    await expect(input).toHaveValue("");

    // Find the send button (arrow icon button next to input)
    const sendBtn = page.locator("button").filter({ has: page.locator("svg") }).last();
    await expect(sendBtn).toBeDisabled();
  });

  test("suggested questions are visible", async ({ page }) => {
    await page.goto("/ask");
    await expect(page.locator("text=How should I train during Ramadan?")).toBeVisible();
    await expect(page.locator("text=What should I eat for Sahoor?")).toBeVisible();
  });
});
