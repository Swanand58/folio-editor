import { test, expect } from '@playwright/test';

test.describe('Editor Basics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tiptap', { state: 'visible', timeout: 15_000 });
    await page.waitForTimeout(1000);
  });

  const mod = process.platform === 'darwin' ? 'Meta' : 'Control';

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

  test('Bold formatting via keyboard shortcut', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('normal ');

    await page.keyboard.press(`${mod}+b`);
    await page.keyboard.type('kbbolded');

    const boldText = page.locator('.tiptap strong:has-text("kbbolded")');
    await expect(boldText).toBeVisible();
  });

  test('Italic formatting via keyboard shortcut', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    await page.keyboard.press(`${mod}+i`);
    await page.keyboard.type('kbitalicized');

    const italicText = page.locator('.tiptap em:has-text("kbitalicized")');
    await expect(italicText).toBeVisible();
  });

  test('Underline formatting via keyboard shortcut', async ({ page }) => {
    const editor = page.locator('.tiptap');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    await page.keyboard.press(`${mod}+u`);
    await page.keyboard.type('kbunderlined');

    const uText = page.locator('.tiptap u:has-text("kbunderlined")');
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

    await page.keyboard.press(`${mod}+z`);
    await page.keyboard.press(`${mod}+z`);
    await page.keyboard.press(`${mod}+z`);
    await page.keyboard.press(`${mod}+z`);
    await page.keyboard.press(`${mod}+z`);

    await expect(page.locator('text=undo-test-marker')).toHaveCount(0);
  });
});
