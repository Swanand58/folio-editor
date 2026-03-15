import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

export interface PageDecorationsOptions {
  headerEnabled: boolean;
  footerEnabled: boolean;
  headerHTML: string;
  footerHTML: string;
  showPageNumber: boolean;
  pageNumberPosition: 'top' | 'bottom';
  pageNumberAlignment: 'left' | 'center' | 'right';
  showPageNumberOnFirst: boolean;
  showTotalPages: boolean;
  pageNumberFormat?: (current: number, total: number) => string;
}

export const pageDecorationsKey = new PluginKey('folioPageDecorations');

/**
 * Renders header, footer, and page number overlays on each page.
 * These are non-editable DOM elements positioned absolutely within
 * the page container, injected after each render via rAF.
 */
export function createPageDecorationsPlugin(
  options: PageDecorationsOptions
): Plugin {
  let rafId: number | null = null;

  return new Plugin({
    key: pageDecorationsKey,

    view() {
      return {
        update(view: EditorView) {
          if (rafId !== null) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            rafId = null;
            renderDecorations(view, options);
          });
        },
        destroy() {
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        },
      };
    },
  });
}

function renderDecorations(
  view: EditorView,
  options: PageDecorationsOptions
): void {
  const pages = view.dom.querySelectorAll('.folio-page');
  const totalPages = pages.length;

  pages.forEach((page, idx) => {
    const pageEl = page as HTMLElement;
    const pageNum = idx + 1;

    // Header
    if (options.headerEnabled) {
      let header = pageEl.querySelector(':scope > .folio-header') as HTMLElement;
      if (!header) {
        header = document.createElement('div');
        header.className = 'folio-header';
        header.contentEditable = 'false';
        pageEl.appendChild(header);
      }
      header.innerHTML = options.headerHTML;
    }

    // Footer container
    if (options.footerEnabled) {
      let footer = pageEl.querySelector(':scope > .folio-footer') as HTMLElement;
      if (!footer) {
        footer = document.createElement('div');
        footer.className = 'folio-footer';
        footer.contentEditable = 'false';
        pageEl.appendChild(footer);
      }
      footer.innerHTML = options.footerHTML;
    }

    // Page number
    const shouldShow = options.showPageNumber && (options.showPageNumberOnFirst || pageNum > 1);

    if (shouldShow) {
      let pnEl = pageEl.querySelector(':scope > .folio-page-number') as HTMLElement;
      if (!pnEl) {
        pnEl = document.createElement('div');
        pnEl.className = 'folio-page-number';
        pnEl.contentEditable = 'false';
        pageEl.appendChild(pnEl);
      }

      const text = options.pageNumberFormat
        ? options.pageNumberFormat(pageNum, totalPages)
        : options.showTotalPages
          ? `${pageNum} / ${totalPages}`
          : `${pageNum}`;

      pnEl.textContent = text;
      pnEl.setAttribute('data-position', options.pageNumberPosition);
      pnEl.setAttribute('data-align', options.pageNumberAlignment);
    } else {
      pageEl.querySelector(':scope > .folio-page-number')?.remove();
    }
  });
}
