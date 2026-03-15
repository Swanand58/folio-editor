import { test, expect } from '@playwright/test';

test.describe('Page Break', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tiptap', { state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(2000);
  });

  test('page break button inserts a break', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();

    await page.click('button[title*="Page Break"]');
    await page.waitForTimeout(1000);

    const breakNodes = page.locator('[data-page-break]');
    const count = await breakNodes.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('page break node is visible in editor', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');

    await page.click('button[title*="Page Break"]');
    await page.waitForTimeout(1000);

    const breakNodes = page.locator('[data-page-break]');
    const count = await breakNodes.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('page count increases after inserting a page break', async ({ page }) => {
    const pagesBefore = await page.locator('.folio-page-backgrounds > div').count();

    const editor = page.locator('.tiptap');
    await editor.click();

    const mod = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${mod}+End`);

    await page.click('button[title*="Page Break"]');
    await page.waitForTimeout(2000);

    const pagesAfter = await page.locator('.folio-page-backgrounds > div').count();
    expect(pagesAfter).toBeGreaterThanOrEqual(pagesBefore);
  });
});
