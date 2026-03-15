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
 * Plugin that injects header, footer, and page number elements into
 * each page's DOM. These are non-editable overlays positioned absolutely
 * within the page container.
 */
export function createPageDecorationsPlugin(
  options: PageDecorationsOptions
): Plugin {
  let lastPageCount = 0;

  return new Plugin({
    key: pageDecorationsKey,

    view() {
      return {
        update(view: EditorView) {
          requestAnimationFrame(() => renderDecorations(view, options));
        },
        destroy() {
          // Decorations are children of page elements, removed automatically
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
      let header = pageEl.querySelector('.folio-header') as HTMLElement;
      if (!header) {
        header = document.createElement('div');
        header.className = 'folio-header';
        header.contentEditable = 'false';
        pageEl.insertBefore(header, pageEl.firstChild);
      }
      header.innerHTML = options.headerHTML;
    } else {
      pageEl.querySelector('.folio-header')?.remove();
    }

    // Footer
    if (options.footerEnabled) {
      let footer = pageEl.querySelector('.folio-footer') as HTMLElement;
      if (!footer) {
        footer = document.createElement('div');
        footer.className = 'folio-footer';
        footer.contentEditable = 'false';
        pageEl.appendChild(footer);
      }
      footer.innerHTML = options.footerHTML;
    } else {
      pageEl.querySelector('.folio-footer')?.remove();
    }

    // Page number
    const shouldShowNumber =
      options.showPageNumber && (options.showPageNumberOnFirst || pageNum > 1);

    if (shouldShowNumber) {
      const position = options.pageNumberPosition;
      const container =
        position === 'top'
          ? pageEl.querySelector('.folio-header') || createOverlay(pageEl, 'folio-header-pn', 'top')
          : pageEl.querySelector('.folio-footer') || createOverlay(pageEl, 'folio-footer-pn', 'bottom');

      let pnEl = pageEl.querySelector('.folio-page-number') as HTMLElement;
      if (!pnEl) {
        pnEl = document.createElement('span');
        pnEl.className = 'folio-page-number';
        pnEl.contentEditable = 'false';
        container.appendChild(pnEl);
      }

      const text = options.pageNumberFormat
        ? options.pageNumberFormat(pageNum, totalPages)
        : options.showTotalPages
          ? `${pageNum} / ${totalPages}`
          : `${pageNum}`;

      pnEl.textContent = text;

      if (container.classList.contains('folio-footer') || container.classList.contains('folio-footer-pn')) {
        container.setAttribute('data-align', options.pageNumberAlignment);
      }
    } else {
      pageEl.querySelector('.folio-page-number')?.remove();
      pageEl.querySelector('.folio-header-pn')?.remove();
      pageEl.querySelector('.folio-footer-pn')?.remove();
    }
  });
}

function createOverlay(
  pageEl: HTMLElement,
  className: string,
  position: 'top' | 'bottom'
): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  el.contentEditable = 'false';
  el.style.position = 'absolute';
  el.style[position] = '0';
  el.style.left = '72px';
  el.style.right = '72px';
  el.style.height = '40px';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.fontSize = '11px';
  el.style.color = '#999';
  el.style.pointerEvents = 'none';

  if (position === 'top') {
    el.style.paddingTop = '24px';
  } else {
    el.style.paddingBottom = '24px';
  }

  pageEl.appendChild(el);
  return el;
}
