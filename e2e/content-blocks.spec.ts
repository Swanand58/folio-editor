import { test, expect } from '@playwright/test';

test.describe('Content Blocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tiptap', { state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(2000);
  });

  test.describe('Table of Contents', () => {
    test('TOC renders with heading links', async ({ page }) => {
      const toc = page.locator('[data-table-of-contents]');
      await expect(toc.first()).toBeVisible();

      const links = toc.first().locator('[data-toc-item]');
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('TOC toolbar button inserts a new TOC', async ({ page }) => {
      const tocsBefore = await page.locator('[data-table-of-contents]').count();

      const editor = page.locator('.tiptap');
      await editor.click();

      const mod = process.platform === 'darwin' ? 'Meta' : 'Control';
      await page.keyboard.press(`${mod}+End`);
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');

      await page.click('button[title="Insert Table of Contents"]');
      await page.waitForTimeout(1000);

      const tocsAfter = await page.locator('[data-table-of-contents]').count();
      expect(tocsAfter).toBeGreaterThan(tocsBefore);
    });
  });

  test.describe('Charts', () => {
    test('bar chart SVG is visible', async ({ page }) => {
      const charts = page.locator('[data-chart-block]');
      await expect(charts.first()).toBeVisible();

      const svg = charts.first().locator('svg');
      await expect(svg).toBeVisible();
    });

    test('multiple chart types are rendered', async ({ page }) => {
      const charts = page.locator('[data-chart-block]');
      const count = await charts.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('Chart toolbar button inserts a new chart', async ({ page }) => {
      const chartsBefore = await page.locator('[data-chart-block]').count();

      const editor = page.locator('.tiptap');
      await editor.click();
      await page.keyboard.press('End');

      await page.click('button[title="Insert Bar Chart"]');
      await page.waitForTimeout(500);

      const chartsAfter = await page.locator('[data-chart-block]').count();
      expect(chartsAfter).toBeGreaterThan(chartsBefore);
    });

    test('clicking a chart selects it with blue outline', async ({ page }) => {
      const chart = page.locator('[data-chart-block]').first();
      await chart.scrollIntoViewIfNeeded();
      await chart.click({ force: true });
      await page.waitForTimeout(300);

      const outline = await chart.evaluate((el) => el.style.outline);
      expect(outline).toMatch(/68CEF8|rgb\(104,\s*206,\s*248\)/);
    });
  });

  test.describe('Math Equations', () => {
    test('math equations are rendered', async ({ page }) => {
      const mathBlocks = page.locator('[data-math-block]');
      const count = await mathBlocks.count();
      expect(count).toBeGreaterThanOrEqual(1);
      await expect(mathBlocks.first()).toBeVisible();
    });

    test('math blocks contain LaTeX content', async ({ page }) => {
      const math = page.locator('[data-math-block]').first();
      const text = await math.textContent();
      expect(text).toBeTruthy();
      expect(text!.length).toBeGreaterThan(0);
    });
  });

  test.describe('SVG Graphics', () => {
    test('SVG architecture diagram renders', async ({ page }) => {
      const svgBlocks = page.locator('[data-svg-block]');
      await expect(svgBlocks.first()).toBeVisible();

      const svg = svgBlocks.first().locator('svg');
      await expect(svg).toBeVisible();
    });

    test('SVG contains expected elements', async ({ page }) => {
      const svg = page.locator('[data-svg-block]').first().locator('svg');
      const rects = await svg.locator('rect').count();
      expect(rects).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Block Selection & Deletion', () => {
    test('selecting and deleting a math block removes it', async ({ page }) => {
      const mathBlocks = page.locator('[data-math-block]');
      const countBefore = await mathBlocks.count();
      expect(countBefore).toBeGreaterThanOrEqual(1);

      const firstMath = mathBlocks.first();
      await firstMath.scrollIntoViewIfNeeded();
      await firstMath.click({ force: true });
      await page.waitForTimeout(300);

      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);

      const countAfter = await mathBlocks.count();
      expect(countAfter).toBeLessThan(countBefore);
    });
  });
});
