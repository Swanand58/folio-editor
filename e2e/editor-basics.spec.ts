import { test, expect } from '@playwright/test';

test.describe('Editor Basics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tiptap', { state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(1000);
  });

  test('editor is visible and contenteditable', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await expect(editor).toBeVisible();
    const editable = await editor.getAttribute('contenteditable');
    expect(editable).toBe('true');
  });

  test('sample content is loaded', async ({ page }) => {
    const heading = page.locator('h1:has-text("Welcome to Folio Editor")');
    await expect(heading).toBeVisible();
  });

  test('typing content works', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('E2E test paragraph');
    await expect(page.locator('text=E2E test paragraph')).toBeVisible();
  });

  test('Bold toolbar button toggles formatting', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('normal ');

    await page.click('button[title*="Bold"]');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.type('bolded');

    const boldText = page.locator('.tiptap strong:has-text("bolded")');
    await expect(boldText).toBeVisible();
  });

  test('Italic toolbar button toggles formatting', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    await page.click('button[title*="Italic"]');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.type('italicized');

    const italicText = page.locator('.tiptap em:has-text("italicized")');
    await expect(italicText).toBeVisible();
  });

  test('Underline toolbar button toggles formatting', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    await page.click('button[title*="Underline"]');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.type('e2eunderlinetest');

    const uText = page.locator('.tiptap u:has-text("e2eunderlinetest")');
    await expect(uText).toBeVisible();
  });

  test('Heading buttons set heading level', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Test heading');

    await page.keyboard.press('Home');
    await page.keyboard.down('Shift');
    await page.keyboard.press('End');
    await page.keyboard.up('Shift');

    await page.click('button[title="Heading 2"]');

    const h2 = page.locator('.tiptap h2:has-text("Test heading")');
    await expect(h2).toBeVisible();
  });

  test('Undo reverses last action', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('undo-test-marker');

    await expect(page.locator('text=undo-test-marker')).toBeVisible();

    const mod = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${mod}+z`);
    await page.keyboard.press(`${mod}+z`);
    await page.keyboard.press(`${mod}+z`);
    await page.keyboard.press(`${mod}+z`);
    await page.keyboard.press(`${mod}+z`);

    await expect(page.locator('text=undo-test-marker')).toHaveCount(0);
  });
});
