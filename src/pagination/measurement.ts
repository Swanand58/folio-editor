import type { EditorView } from '@tiptap/pm/view';

/**
 * Measures the rendered height of content inside a specific page node.
 * Uses the actual DOM elements rendered by ProseMirror.
 */
export function measurePageContentHeight(
  view: EditorView,
  pagePos: number
): number {
  const dom = view.nodeDOM(pagePos);
  if (!dom || !(dom instanceof HTMLElement)) return 0;

  let totalHeight = 0;
  for (let i = 0; i < dom.children.length; i++) {
    const child = dom.children[i] as HTMLElement;
    const rect = child.getBoundingClientRect();
    const style = window.getComputedStyle(child);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    totalHeight += rect.height + marginTop + marginBottom;
  }

  return totalHeight;
}

/**
 * Finds the index (relative to the page node) of the first child block
 * that causes the content to exceed maxHeight.
 * Returns -1 if everything fits.
 */
export function findOverflowChildIndex(
  view: EditorView,
  pagePos: number,
  maxHeight: number
): number {
  const dom = view.nodeDOM(pagePos);
  if (!dom || !(dom instanceof HTMLElement)) return -1;

  let accumulated = 0;
  for (let i = 0; i < dom.children.length; i++) {
    const child = dom.children[i] as HTMLElement;
    const rect = child.getBoundingClientRect();
    const style = window.getComputedStyle(child);
    const marginTop = parseFloat(style.marginTop) || 0;
    const marginBottom = parseFloat(style.marginBottom) || 0;
    accumulated += rect.height + marginTop + marginBottom;

    if (accumulated > maxHeight + 1) {
      return i;
    }
  }

  return -1;
}
