import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

export const paginationPluginKey = new PluginKey('folioPagination');

export interface PaginationEngineOptions {
  pageHeight: number;
  pageWidth: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  headerHeight: number;
  footerHeight: number;
  pageGap: number;
  showPageNumber: boolean;
  pageNumberPosition: 'top' | 'bottom';
  pageNumberAlignment: 'left' | 'center' | 'right';
  showPageNumberOnFirst: boolean;
  showTotalPages: boolean;
  pageNumberFormat?: (current: number, total: number) => string;
  headerHTML: string;
  footerHTML: string;
  headerEnabled: boolean;
  footerEnabled: boolean;
}

/**
 * Visual pagination plugin.
 *
 * Instead of splitting content into structural page nodes (which fights
 * ProseMirror's editing model), this plugin:
 *
 * 1. Lets content flow naturally in a single document
 * 2. Measures rendered content height after each change
 * 3. Overlays visual page breaks, headers, footers, and page numbers
 *    using absolutely-positioned DOM elements
 *
 * This approach:
 * - Never dispatches transactions (no infinite loops)
 * - Never modifies the ProseMirror document structure
 * - Never resets scroll position
 * - Works with native copy/paste, selection, undo/redo
 */
export function createPaginationPlugin(options: PaginationEngineOptions): Plugin {
  let overlayContainer: HTMLDivElement | null = null;
  let rafId: number | null = null;

  return new Plugin({
    key: paginationPluginKey,

    view(view: EditorView) {
      overlayContainer = document.createElement('div');
      overlayContainer.className = 'folio-overlay-container';
      overlayContainer.style.position = 'absolute';
      overlayContainer.style.top = '0';
      overlayContainer.style.left = '0';
      overlayContainer.style.right = '0';
      overlayContainer.style.pointerEvents = 'none';
      overlayContainer.style.zIndex = '10';

      // The editor's parent needs position:relative for absolute overlay
      const editorParent = view.dom.parentElement;
      if (editorParent) {
        editorParent.style.position = 'relative';
      }
      view.dom.parentElement?.appendChild(overlayContainer);

      // Initial render
      scheduleRender(view);

      return {
        update() {
          scheduleRender(view);
        },
        destroy() {
          if (rafId !== null) cancelAnimationFrame(rafId);
          overlayContainer?.remove();
          overlayContainer = null;
        },
      };
    },
  });

  function scheduleRender(view: EditorView) {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      renderPageOverlays(view, options, overlayContainer);
    });
  }
}

function renderPageOverlays(
  view: EditorView,
  options: PaginationEngineOptions,
  container: HTMLDivElement | null
): void {
  if (!container) return;

  const editorDom = view.dom;
  const editorRect = editorDom.getBoundingClientRect();
  const contentHeight = options.pageHeight - options.marginTop - options.marginBottom -
    (options.headerEnabled ? options.headerHeight : 0) -
    (options.footerEnabled ? options.footerHeight : 0);

  const totalContentHeight = editorDom.scrollHeight;
  const pageCount = Math.max(1, Math.ceil(totalContentHeight / contentHeight));

  // Clear previous overlays
  container.innerHTML = '';
  container.style.height = `${pageCount * options.pageHeight + (pageCount - 1) * options.pageGap}px`;

  for (let i = 0; i < pageCount; i++) {
    const pageTop = i * (options.pageHeight + options.pageGap);

    // Page break line (between pages)
    if (i > 0) {
      const breakEl = document.createElement('div');
      breakEl.className = 'folio-page-break';
      breakEl.style.position = 'absolute';
      breakEl.style.top = `${pageTop - options.pageGap}px`;
      breakEl.style.left = '0';
      breakEl.style.right = '0';
      breakEl.style.height = `${options.pageGap}px`;
      container.appendChild(breakEl);
    }

    // Header
    if (options.headerEnabled && options.headerHTML) {
      const header = document.createElement('div');
      header.className = 'folio-header';
      header.innerHTML = options.headerHTML;
      header.style.position = 'absolute';
      header.style.top = `${pageTop + 8}px`;
      header.style.left = `${options.marginLeft}px`;
      header.style.right = `${options.marginRight}px`;
      header.style.height = `${options.headerHeight}px`;
      container.appendChild(header);
    }

    // Page number
    const showNumber = options.showPageNumber && (options.showPageNumberOnFirst || i > 0);
    if (showNumber) {
      const pn = document.createElement('div');
      pn.className = 'folio-page-number';
      const text = options.pageNumberFormat
        ? options.pageNumberFormat(i + 1, pageCount)
        : options.showTotalPages
          ? `${i + 1} / ${pageCount}`
          : `${i + 1}`;
      pn.textContent = text;

      pn.style.position = 'absolute';
      pn.style.left = `${options.marginLeft}px`;
      pn.style.right = `${options.marginRight}px`;

      if (options.pageNumberPosition === 'bottom') {
        pn.style.top = `${pageTop + options.pageHeight - options.marginBottom + 4}px`;
      } else {
        pn.style.top = `${pageTop + 8}px`;
      }

      pn.setAttribute('data-align', options.pageNumberAlignment);
      container.appendChild(pn);
    }

    // Footer
    if (options.footerEnabled && options.footerHTML) {
      const footer = document.createElement('div');
      footer.className = 'folio-footer';
      footer.innerHTML = options.footerHTML;
      footer.style.position = 'absolute';
      footer.style.top = `${pageTop + options.pageHeight - options.marginBottom - options.footerHeight}px`;
      footer.style.left = `${options.marginLeft}px`;
      footer.style.right = `${options.marginRight}px`;
      footer.style.height = `${options.footerHeight}px`;
      container.appendChild(footer);
    }
  }
}
