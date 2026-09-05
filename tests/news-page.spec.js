// Test Structure for In The News Page
// Group 1: Page Load and Elements
// Group 2: Content Integrity
// Group 3: Accessibility
// Group 4: Page Health
// Group 5: Layout

import { test, expect } from '@playwright/test';
import { newsTestData } from '../test-data';

test.describe('Saayam In The News Page Tests', () => {
  const {
    pageUrl,
    pageContent,
    breadcrumbItems,
    cardHeadings,
    expectedMinCards,
    placeholderText,
    disallowedEmoji,
    selectors,
    mobileViewport,
  } = newsTestData;

  test.describe('Page Load and Elements', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pageUrl);
    });

    test('should load news page with correct heading', async ({ page }) => {
      const heading = page.getByRole('heading', { name: pageContent.heading });
      await expect(heading).toBeVisible();
      const headingText = await heading.textContent();
      expect(headingText?.trim()).toBe(pageContent.heading);
    });

    test('should display description text correctly', async ({ page }) => {
      const description = page.getByText(pageContent.description);
      await expect(description).toBeVisible();
    });

    test('should display breadcrumb trail', async ({ page }) => {
      for (const item of breadcrumbItems) {
        await expect(page.getByText(item).first()).toBeVisible();
      }
    });

    test('should display known story card headings', async ({ page }) => {
      for (const cardHeading of cardHeadings) {
        await expect(page.getByText(cardHeading).first()).toBeVisible();
      }
    });

    test('should render the expected number of story cards', async ({ page }) => {
      await page.waitForLoadState('networkidle');
      const images = await page.locator('img').count();
      expect(images).toBeGreaterThanOrEqual(expectedMinCards);
    });

    test('should display Join Our Community CTA', async ({ page }) => {
      const ctaHeading = page.getByRole('heading', { name: pageContent.ctaHeading });
      await expect(ctaHeading).toBeVisible();
      const cta = page
        .getByRole('link', { name: pageContent.ctaButton })
        .or(page.getByRole('button', { name: pageContent.ctaButton }))
        .first();
      await expect(cta).toBeVisible();
    });
  });

  test.describe('Content Integrity', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
    });

    test('should not display placeholder or leaked text', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      for (const placeholder of placeholderText) {
        expect(bodyText, 'Found placeholder: ' + placeholder).not.toContain(placeholder);
      }
    });

    test('should not display emoji in body copy', async ({ page }) => {
      const bodyText = await page.locator('body').innerText();
      const found = disallowedEmoji.filter((e) => bodyText.includes(e));
      expect(found, 'Emoji present in production copy: ' + found.join(' ')).toEqual([]);
    });

    test('should not have broken images', async ({ page }) => {
      const broken = await page.$$eval('img', (imgs) =>
        imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src)
      );
      expect(broken, 'Broken images: ' + broken.join(', ')).toEqual([]);
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
    });

    test('should have non-empty alt text on all images', async ({ page }) => {
      const missing = await page.$$eval('img', (imgs) =>
        imgs.filter((i) => !i.getAttribute('alt') || !i.getAttribute('alt').trim()).map((i) => i.src)
      );
      expect(missing, 'Images missing alt text: ' + missing.join(', ')).toEqual([]);
    });

    test('should use rel noopener on links opening in a new tab', async ({ page }) => {
      const unsafe = await page.$$eval("a[target='_blank']", (links) =>
        links.filter((a) => !(a.getAttribute('rel') || '').includes('noopener')).map((a) => a.href)
      );
      expect(unsafe, 'target=_blank without rel=noopener: ' + unsafe.join(', ')).toEqual([]);
    });
  });

  test.describe('Page Health', () => {
    test('should load without console errors', async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      expect(errors, 'Console errors: ' + errors.join(' | ')).toEqual([]);
    });

    test('should have a reCAPTCHA site key valid for this domain', async ({ page }) => {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      const badge = page.locator(selectors.recaptchaBadge);
      if ((await badge.count()) > 0) {
        const badgeText = await badge.first().innerText();
        expect(badgeText, 'reCAPTCHA badge reports an error').not.toContain('ERROR');
        expect(badgeText, 'reCAPTCHA site key not registered for this domain').not.toContain('Invalid domain');
      }
    });

    test('should not contain dead links', async ({ page, request }) => {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      const hrefs = [
        ...new Set(await page.$$eval("a[href^='http']", (links) => links.map((a) => a.href))),
      ];
      const dead = [];
      for (const url of hrefs) {
        try {
          const response = await request.get(url, { timeout: 15000, maxRedirects: 5 });
          if (response.status() >= 400) dead.push(response.status() + ' ' + url);
        } catch {
          dead.push('UNREACHABLE ' + url);
        }
      }
      expect(dead, 'Dead links: ' + dead.join(' | ')).toEqual([]);
    });
  });

  test.describe('Layout', () => {
    test('should not overlap scroll-top button with reCAPTCHA badge', async ({ page }) => {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      await page.mouse.wheel(0, 3000);
      await page.waitForTimeout(800);
      const button = page.locator(selectors.scrollTopButton).first();
      const badge = page.locator(selectors.recaptchaBadge).first();
      if ((await button.count()) > 0 && (await badge.count()) > 0) {
        const b = await button.boundingBox();
        const g = await badge.boundingBox();
        if (b && g) {
          const overlaps =
            b.x < g.x + g.width && b.x + b.width > g.x && b.y < g.y + g.height && b.y + b.height > g.y;
          expect(overlaps, 'Scroll-top button overlaps the reCAPTCHA badge').toBe(false);
        }
      }
    });

    test('should not scroll horizontally', async ({ page }) => {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, 'Page overflows horizontally by ' + overflow + 'px').toBeLessThanOrEqual(1);
    });

    test('should render correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize(mobileViewport);
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      const heading = page.getByRole('heading', { name: pageContent.heading });
      await expect(heading).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, 'Mobile view overflows by ' + overflow + 'px').toBeLessThanOrEqual(1);
    });
  });
});
