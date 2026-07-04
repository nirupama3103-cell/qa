import { test, expect } from "@playwright/test";

test.describe("Volunteer Service - How We Operate (#53)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/how-we-operate");
  });

  test("page loads with correct breadcrumb", async ({ page }) => {
    await expect(page).toHaveURL(/how-we-operate/);
    await expect(page.getByText("Home")).toBeVisible();
    await expect(page.getByText("Volunteer Service")).toBeVisible();
  });

  test("displays How We Operate heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "How We Operate" })).toBeVisible();
  });

  test("displays all 5 process steps", async ({ page }) => {
    const steps = [
      "Request for Help",
      "Get Matched With a Volunteer",
      "Confirm Your Volunteer",
      "Connect and Coordinate",
      "Receive Assistance",
    ];
    for (const step of steps) {
      await expect(page.getByText(step)).toBeVisible();
    }
  });

  test("displays Join the community CTA button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Join the community" })).toBeVisible();
  });

  test("Join the community button is clickable", async ({ page }) => {
    const joinBtn = page.getByRole("button", { name: "Join the community" });
    await expect(joinBtn).toBeEnabled();
  });

  test("page has no console errors on load", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/how-we-operate");
    await page.waitForLoadState("networkidle");
    expect(errors, `Console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("no broken images", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();
    const broken = [];
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src");
      const w = await images.nth(i).evaluate((el) => el.naturalWidth);
      if (w === 0) broken.push(src || "(no src)");
    }
    expect(broken, `Broken images: ${broken.join(", ")}`).toEqual([]);
  });

  test("no placeholder/leaked text", async ({ page }) => {
    const bodyText = await page.locator("body").innerText();
    for (const pattern of ["undefined", "null", "NaN", "[object Object]"]) {
      expect(bodyText.includes(pattern), `Found "${pattern}" on page`).toBe(false);
    }
  });

  test("page is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole("heading", { name: "How We Operate" })).toBeVisible();
  });
});

test.describe("Volunteer Service - Our Collaborators (#53)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/collaborators");
  });

  test("page loads with correct breadcrumb", async ({ page }) => {
    await expect(page).toHaveURL(/collaborators/);
    await expect(page.getByText("Home")).toBeVisible();
    await expect(page.getByText("Volunteer Service")).toBeVisible();
  });

  test("displays Our Collaborators heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Our Collaborators" })).toBeVisible();
  });

  test("displays all 5 partner organization cards", async ({ page }) => {
    const partners = [
      "Idealist",
      "TBI4Life",
      "Sri Sathya Sai Annapoorna Trust",
      "The Driven Scholars Foundation",
      "South Portland Food Cupboard",
    ];
    for (const partner of partners) {
      await expect(page.getByText(partner, { exact: false }).first()).toBeVisible();
    }
  });

  test("each partner name is a working link", async ({ page }) => {
    const partners = [
      "Idealist",
      "TBI4Life",
      "Sri Sathya Sai Annapoorna Trust",
      "The Driven Scholars Foundation",
      "South Portland Food Cupboard",
    ];
    for (const partner of partners) {
      const link = page.getByRole("link", { name: partner });
      const href = await link.getAttribute("href").catch(() => null);
      expect(href, `${partner} link missing/empty href`).toBeTruthy();
    }
  });

  test("displays Join the community CTA button", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Join the community" })).toBeVisible();
  });

  test("page has no console errors on load", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/collaborators");
    await page.waitForLoadState("networkidle");
    expect(errors, `Console errors: ${errors.join("\n")}`).toEqual([]);
  });

  test("no broken partner logo images", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();
    const broken = [];
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src");
      const w = await images.nth(i).evaluate((el) => el.naturalWidth);
      if (w === 0) broken.push(src || "(no src)");
    }
    expect(broken, `Broken images: ${broken.join(", ")}`).toEqual([]);
  });

  test("no placeholder/leaked text", async ({ page }) => {
    const bodyText = await page.locator("body").innerText();
    for (const pattern of ["undefined", "null", "NaN", "[object Object]"]) {
      expect(bodyText.includes(pattern), `Found "${pattern}" on page`).toBe(false);
    }
  });

  test("page is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole("heading", { name: "Our Collaborators" })).toBeVisible();
  });
});
