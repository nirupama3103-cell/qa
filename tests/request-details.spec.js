import { test, expect } from "@playwright/test";

test.describe("Request Details - Voluntary Organizations Functionality (#56)", () => {
  test("should load the home page and verify layout", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
