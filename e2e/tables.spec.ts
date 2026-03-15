import { test, expect } from '@playwright/test';

test.describe('Tables', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tiptap', { state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(1000);
  });

  test('sample content includes a table', async ({ page }) => {
    const table = page.locator('.tiptap table');
    await expect(table.first()).toBeVisible();
  });

  test('table has header row and data rows', async ({ page }) => {
    const headerCells = page.locator('.tiptap table th');
    const dataCells = page.locator('.tiptap table td');

    const headerCount = await headerCells.count();
    const dataCount = await dataCells.count();

    expect(headerCount).toBeGreaterThanOrEqual(3);
    expect(dataCount).toBeGreaterThanOrEqual(3);
  });

  test('Insert Table button adds a new table', async ({ page }) => {
    const tablesBefore = await page.locator('.tiptap table').count();

    await page.click('button[title="Insert Table"]');
    await page.waitForTimeout(500);

    const tablesAfter = await page.locator('.tiptap table').count();
    expect(tablesAfter).toBeGreaterThan(tablesBefore);
  });

  test('table cells are editable', async ({ page }) => {
    const firstCell = page.locator('.tiptap table td').first();
    await firstCell.click();
    await page.keyboard.type(' edited');

    const text = await firstCell.textContent();
    expect(text).toContain('edited');
  });
});
