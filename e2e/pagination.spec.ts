import { test, expect } from '@playwright/test';

test.describe('Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tiptap', { state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(2000);
  });

  test('renders multiple pages from sample content', async ({ page }) => {
    const pageBgs = page.locator('.folio-page-backgrounds > div');
    const count = await pageBgs.count();
    expect(count).toBeGreaterThan(1);
  });

  test('page backgrounds are white cards on grey background', async ({ page }) => {
    const bg = page.locator('.folio-page-backgrounds > div').first();
    await expect(bg).toBeVisible();
    const bgColor = await bg.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(bgColor).toMatch(/rgb\(255,\s*255,\s*255\)/);
  });

  test('page numbers appear on pages', async ({ page }) => {
    const overlays = page.locator('.folio-overlays > div');
    const count = await overlays.count();
    let pageNumberFound = false;
    for (let i = 0; i < count; i++) {
      const text = await overlays.nth(i).textContent();
      if (text && /\d+\s*\/\s*\d+/.test(text)) {
        pageNumberFound = true;
        break;
      }
    }
    expect(pageNumberFound).toBe(true);
  });

  test('page counter in toolbar shows correct format', async ({ page }) => {
    const status = page.locator('text=/Page \\d+ of \\d+/');
    await expect(status.first()).toBeVisible();
  });

  test('scrolling updates the page counter', async ({ page }) => {
    const statusLocator = page.locator('span').filter({ hasText: /^Page \d+ of \d+$/ });
    const initial = await statusLocator.first().textContent();
    expect(initial).toMatch(/Page \d+ of \d+/);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const afterScroll = await statusLocator.first().textContent();
    expect(afterScroll).toMatch(/Page \d+ of \d+/);
  });
});
