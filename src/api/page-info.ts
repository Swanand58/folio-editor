import type { Editor } from '@tiptap/core';
import {
  getPageInfoFromCache,
  type PageInfoData,
} from '../pagination/PaginationPlugin';

export type { PageInfoData, PageInfoEntry } from '../pagination/PaginationPlugin';

/**
 * Returns the current page layout computed by the pagination plugin.
 * Each page entry includes its index, absolute top position (relative to
 * the editor's offset parent), and height in pixels.
 */
export function getPageInfo(editor: Editor): PageInfoData | null {
  return getPageInfoFromCache(editor.view.dom as HTMLElement);
}

/**
 * Returns the 1-indexed page number that contains the current cursor position.
 */
export function getCurrentPage(editor: Editor): number {
  return getActivePage(editor, 'cursor');
}

/**
 * Returns the 1-indexed page number that is most visible in the viewport.
 * Useful for updating a "Page X of Y" indicator while the user scrolls.
 */
export function getVisiblePage(editor: Editor): number {
  return getActivePage(editor, 'viewport');
}

/**
 * Returns the 1-indexed page number based on the chosen mode:
 * - `'cursor'`   — the page containing the text cursor
 * - `'viewport'` — the page most visible in the viewport (default)
 */
export function getActivePage(
  editor: Editor,
  mode: 'cursor' | 'viewport' = 'viewport',
): number {
  const info = getPageInfo(editor);
  if (!info || info.pageCount <= 1) return 1;

  const parent = editor.view.dom.parentElement;
  if (!parent) return 1;
  const parentAbsTop = parent.getBoundingClientRect().top + window.scrollY;

  let relativeY: number;
  if (mode === 'cursor') {
    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    relativeY = coords.top + window.scrollY - parentAbsTop;
  } else {
    relativeY = window.scrollY + window.innerHeight / 2 - parentAbsTop;
  }

  for (let i = info.pages.length - 1; i >= 0; i--) {
    if (relativeY >= info.pages[i].top) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Smoothly scrolls the window so that the given page (1-indexed) is at the
 * top of the viewport.
 */
export function scrollToPage(editor: Editor, pageNumber: number): void {
  const info = getPageInfo(editor);
  if (!info) return;
  const page = info.pages[pageNumber - 1];
  if (!page) return;

  const parent = editor.view.dom.parentElement;
  if (!parent) return;
  const parentAbsTop = parent.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: parentAbsTop + page.top, behavior: 'smooth' });
}
