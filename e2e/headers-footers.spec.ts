import { test, expect } from '@playwright/test';

test.describe('Headers & Footers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tiptap', { state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(2000);
  });

  test('header region is present with initial content', async ({ page }) => {
    const header = page.locator('.folio-header-editable');
    await expect(header.first()).toBeVisible();
    const text = await header.first().textContent();
    expect(text).toContain('Folio Editor');
  });

  test('footer region is present', async ({ page }) => {
    const footer = page.locator('.folio-footer-editable');
    await expect(footer.first()).toBeVisible();
  });

  test('clicking header makes it editable', async ({ page }) => {
    const header = page.locator('.folio-header-editable').first();
    await header.click();
    await page.waitForTimeout(300);

    const editable = await header.evaluate(
      (el) => el.getAttribute('contenteditable'),
    );
    expect(editable).toBe('true');
  });

  test('typing in header updates its content', async ({ page }) => {
    const header = page.locator('.folio-header-editable').first();
    await header.click();
    await page.waitForTimeout(300);

    await page.keyboard.press('End');
    await page.keyboard.type(' - E2E');
    await page.waitForTimeout(300);

    const text = await header.first().textContent();
    expect(text).toContain('E2E');
  });

  test('header content syncs across pages', async ({ page }) => {
    const headers = page.locator('.folio-header-editable');
    const count = await headers.count();

    if (count < 2) {
      test.skip();
      return;
    }

    await headers.first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('End');
    await page.keyboard.type(' SYNC');

    await page.locator('.tiptap').click();
    await page.waitForTimeout(500);

    const secondHeaderText = await headers.nth(1).textContent();
    expect(secondHeaderText).toContain('SYNC');
  });
});
