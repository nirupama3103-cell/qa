import { test, expect } from "@playwright/test";

test.describe("Breadcrumbs UI Functionality (#54)", () => {
  test("home page loads successfully", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
  });

  test("breadcrumb is visible on a nested page", async ({ page }) => {
    await page.goto("/how-we-operate");
    const breadcrumb = page.getByLabel("breadcrumb");
    await expect(breadcrumb).toBeVisible();
  });

  test("breadcrumb displays correct trail for a nested page", async ({ page }) => {
    await page.goto("/how-we-operate");
    const breadcrumb = page.getByLabel("breadcrumb");
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("Volunteer Service")).toBeVisible();
  });

  test("breadcrumb Home link navigates back to home page", async ({ page }) => {
    await page.goto("/how-we-operate");
    const breadcrumb = page.getByLabel("breadcrumb");
    await breadcrumb.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("breadcrumb trail updates correctly across different nested pages", async ({ page }) => {
    await page.goto("/collaborators");
    const breadcrumb = page.getByLabel("breadcrumb");
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("Volunteer Service")).toBeVisible();
  });

  test("breadcrumb links have valid href attributes (no dead links)", async ({ page }) => {
    await page.goto("/how-we-operate");
    const breadcrumb = page.getByLabel("breadcrumb");
    const links = breadcrumb.locator("a");
    const count = await links.count();
    const brokenLinks = [];
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute("href");
      if (!href || href === "#" || href.trim() === "") {
        const text = await links.nth(i).innerText().catch(() => "(no text)");
        brokenLinks.push(`"${text}" -> "${href}"`);
      }
    }
    expect(brokenLinks, `Breadcrumb links with missing/placeholder href: ${brokenLinks.join(", ")}`).toEqual([]);
  });

  test("breadcrumb has no console errors on load", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/how-we-operate");
    await page.waitForLoadState("networkidle");
    expect(errors, `Console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("breadcrumb is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/how-we-operate");
    const breadcrumb = page.getByLabel("breadcrumb");
    await expect(breadcrumb).toBeVisible();
  });
});
