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
  pageBreakBackground: string;
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
 * Content-aware pagination plugin.
 *
 * Instead of masking fixed zones (which clips content mid-element), this plugin:
 * 1. Measures all top-level block children in the editor
 * 2. Finds the last block that fully fits within each page's content area
 * 3. Injects CSS margin-bottom on that block to push subsequent content to the
 *    next page, creating real gaps aligned with block element boundaries
 * 4. Renders per-page card backgrounds, gap bars, headers, footers, page numbers
 *
 * The CSS is injected via a <style> element in <head> (not inline styles on editor
 * children), so ProseMirror's MutationObserver is never triggered.
 */
export function createPaginationPlugin(options: PaginationEngineOptions): Plugin {
  let overlayContainer: HTMLDivElement | null = null;
  let pageBackgrounds: HTMLDivElement | null = null;
  let breakStyleEl: HTMLStyleElement | null = null;
  let rafId: number | null = null;
  let prevDoc: unknown = null;
  let resizeObserver: ResizeObserver | null = null;

  function schedule(view: EditorView) {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      repaginate(view);
    });
  }

  function repaginate(view: EditorView) {
    if (!overlayContainer || !breakStyleEl) return;

    const editor = view.dom as HTMLElement;
    const parent = editor.parentElement;

    // Re-apply positioning on every cycle (React re-renders may clear inline styles)
    if (parent) {
      parent.style.position = 'relative';
      parent.style.zIndex = '0';
    }

    if (view.state.doc === prevDoc) return;
    prevDoc = view.state.doc;

    const opts = options;

    const paddingTop = opts.marginTop + opts.headerHeight;
    const paddingBottom = opts.marginBottom + opts.footerHeight;
    const contentAreaHeight = opts.pageHeight - paddingTop - paddingBottom;
    const gapBridge = paddingBottom + opts.pageGap + paddingTop;

    // --- Step 1: Clear injected break styles to get a "clean" layout ---
    const savedScrollY = window.scrollY;
    breakStyleEl.textContent = '';
    void editor.offsetHeight; // synchronous reflow

    const children = Array.from(editor.children) as HTMLElement[];

    // --- Step 2: Find page break points in the clean layout ---
    const breaks = findBreaks(children, paddingTop, contentAreaHeight);
    const pageCount = breaks.length + 1;

    // --- Step 3: Inject CSS margins to create real content gaps ---
    let css = '';
    for (const brk of breaks) {
      const nthChild = brk.childIndex + 1; // CSS nth-child is 1-indexed
      const totalMargin = brk.remainingSpace + gapBridge;
      css += `.ProseMirror > :nth-child(${nthChild}){margin-bottom:${totalMargin}px !important}\n`;
    }
    const minHeight = pageCount * opts.pageHeight + (pageCount - 1) * opts.pageGap;
    css += `.ProseMirror{min-height:${minHeight}px !important}\n`;

    breakStyleEl.textContent = css;
    void editor.offsetHeight; // reflow with injected margins
    window.scrollTo(0, savedScrollY);

    // --- Step 4: Compute actual page positions after margin injection ---
    const editorTop = editor.offsetTop;
    const editorLeft = editor.offsetLeft;
    const editorWidth = editor.offsetWidth;
    const contentLeft = editorLeft + opts.marginLeft;
    const contentWidth = editorWidth - opts.marginLeft - opts.marginRight;

    const pageStartYs: number[] = [editorTop];
    const gapYPositions: number[] = [];
    for (const brk of breaks) {
      const childBottom = children[brk.childIndex].offsetTop + children[brk.childIndex].offsetHeight;
      const gapY = editorTop + childBottom + brk.remainingSpace + paddingBottom;
      gapYPositions.push(gapY);
      pageStartYs.push(gapY + opts.pageGap);
    }

    // --- Step 5: Render visual elements ---
    overlayContainer.innerHTML = '';
    if (pageBackgrounds) pageBackgrounds.innerHTML = '';

    const bgColor = opts.pageBreakBackground || '#e8e8e8';

    for (let i = 0; i < pageCount; i++) {
      const pageY = pageStartYs[i];

      // Per-page white card with shadow
      pageBackgrounds?.appendChild(makeEl({
        position: 'absolute',
        top: `${pageY}px`,
        left: `${editorLeft}px`,
        width: `${editorWidth}px`,
        height: `${opts.pageHeight}px`,
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        borderRadius: '2px',
      }));

      // Header
      if (opts.headerEnabled && opts.headerHTML) {
        const headerY = pageY + (opts.marginTop - opts.headerHeight) / 2;
        const header = makeEl({
          position: 'absolute',
          top: `${headerY}px`,
          left: `${contentLeft}px`,
          width: `${contentWidth}px`,
          height: `${opts.headerHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          color: '#999',
          overflow: 'hidden',
          zIndex: '5',
        });
        header.innerHTML = opts.headerHTML;
        overlayContainer.appendChild(header);
      }

      // Footer
      if (opts.footerEnabled && opts.footerHTML) {
        const footerY = pageY + opts.pageHeight - opts.marginBottom
          + (opts.marginBottom - opts.footerHeight) / 2;
        const footer = makeEl({
          position: 'absolute',
          top: `${footerY}px`,
          left: `${contentLeft}px`,
          width: `${contentWidth}px`,
          height: `${opts.footerHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          color: '#999',
          overflow: 'hidden',
          zIndex: '5',
        });
        footer.innerHTML = opts.footerHTML;
        overlayContainer.appendChild(footer);
      }

      // Page number
      const pageNum = i + 1;
      const showNum = opts.showPageNumber && (opts.showPageNumberOnFirst || pageNum > 1);
      if (showNum) {
        const atBottom = opts.pageNumberPosition === 'bottom';
        const pnY = atBottom
          ? pageY + opts.pageHeight - opts.marginBottom + (opts.marginBottom - 20) / 2
          : pageY + (opts.marginTop - 20) / 2;
        const pn = makeEl({
          position: 'absolute',
          top: `${pnY}px`,
          left: `${contentLeft}px`,
          width: `${contentWidth}px`,
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '11px',
          color: '#999',
          zIndex: '5',
          justifyContent:
            opts.pageNumberAlignment === 'left'
              ? 'flex-start'
              : opts.pageNumberAlignment === 'right'
                ? 'flex-end'
                : 'center',
        });
        pn.textContent = formatPageNumber(opts, pageNum, pageCount);
        overlayContainer.appendChild(pn);
      }

      // Gap bar between pages
      if (i < pageCount - 1) {
        overlayContainer.appendChild(makeEl({
          position: 'absolute',
          top: `${gapYPositions[i]}px`,
          left: `${editorLeft}px`,
          width: `${editorWidth}px`,
          height: `${opts.pageGap}px`,
          background: bgColor,
          zIndex: '4',
          borderTop: '1px solid #d0d0d0',
          borderBottom: '1px solid #d0d0d0',
          boxSizing: 'border-box',
        }));
      }
    }

    const totalHeight = pageStartYs[pageCount - 1] + opts.pageHeight;
    overlayContainer.style.height = `${totalHeight}px`;
    if (pageBackgrounds) pageBackgrounds.style.height = `${totalHeight}px`;
  }

  return new Plugin({
    key: paginationPluginKey,

    view(view: EditorView) {
      const parent = view.dom.parentElement;
      if (!parent) return {};

      parent.style.position = 'relative';
      parent.style.zIndex = '0';

      // Background layer for per-page card shadows (z-index -1, behind editor)
      pageBackgrounds = document.createElement('div');
      pageBackgrounds.className = 'folio-page-backgrounds';
      Object.assign(pageBackgrounds.style, {
        position: 'absolute', top: '0', left: '0', width: '100%',
        pointerEvents: 'none', zIndex: '-1',
      });
      parent.insertBefore(pageBackgrounds, parent.firstChild);

      // Overlay layer for gap bars, headers, footers, page numbers (z-index 10)
      overlayContainer = document.createElement('div');
      overlayContainer.className = 'folio-overlays';
      overlayContainer.setAttribute('data-folio-overlay', '');
      Object.assign(overlayContainer.style, {
        position: 'absolute', top: '0', left: '0', width: '100%',
        pointerEvents: 'none', zIndex: '10',
      });
      parent.appendChild(overlayContainer);

      // <style> element in <head> for break margin injections
      breakStyleEl = document.createElement('style');
      breakStyleEl.setAttribute('data-folio-breaks', '');
      document.head.appendChild(breakStyleEl);

      // Re-paginate when the editor element resizes (text reflows)
      resizeObserver = new ResizeObserver(() => {
        prevDoc = null;
        schedule(view);
      });
      resizeObserver.observe(view.dom);

      schedule(view);

      return {
        update() { schedule(view); },
        destroy() {
          if (rafId !== null) cancelAnimationFrame(rafId);
          resizeObserver?.disconnect();
          overlayContainer?.remove();
          pageBackgrounds?.remove();
          breakStyleEl?.remove();
          overlayContainer = null;
          pageBackgrounds = null;
          breakStyleEl = null;
          prevDoc = null;
          resizeObserver = null;
        },
      };
    },
  });
}

// ---------------------------------------------------------------------------
// Break-point detection
// ---------------------------------------------------------------------------

interface BreakPoint {
  childIndex: number;
  remainingSpace: number;
}

/**
 * Walk the editor's direct block children and find where each page break
 * should go. A break is placed after the last child whose bottom edge fits
 * within the current page's content area.
 */
function findBreaks(
  children: HTMLElement[],
  firstPageStart: number,
  contentAreaHeight: number,
): BreakPoint[] {
  const result: BreakPoint[] = [];
  let startIdx = 0;
  let searchFrom = firstPageStart;

  for (let safety = 0; safety < 200; safety++) {
    const pageEnd = searchFrom + contentAreaHeight;
    let lastFittingIdx = -1;
    let lastFittingBottom = searchFrom;

    for (let i = startIdx; i < children.length; i++) {
      const bottom = children[i].offsetTop + children[i].offsetHeight;
      if (bottom <= pageEnd) {
        lastFittingIdx = i;
        lastFittingBottom = bottom;
      } else {
        break;
      }
    }

    // If no child fits, force the first one onto this page (oversized element)
    if (lastFittingIdx === -1 && startIdx < children.length) {
      lastFittingIdx = startIdx;
      lastFittingBottom = children[startIdx].offsetTop + children[startIdx].offsetHeight;
    }

    if (lastFittingIdx === -1 || lastFittingIdx >= children.length - 1) break;

    result.push({
      childIndex: lastFittingIdx,
      remainingSpace: Math.max(0, pageEnd - lastFittingBottom),
    });

    startIdx = lastFittingIdx + 1;
    if (startIdx >= children.length) break;
    searchFrom = children[startIdx].offsetTop;
  }

  return result;
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

function makeEl(styles: Record<string, string>): HTMLDivElement {
  const el = document.createElement('div');
  el.style.pointerEvents = 'none';
  Object.assign(el.style, styles);
  return el;
}

function formatPageNumber(
  opts: PaginationEngineOptions,
  current: number,
  total: number,
): string {
  if (opts.pageNumberFormat) return opts.pageNumberFormat(current, total);
  return opts.showTotalPages ? `${current} / ${total}` : `${current}`;
}
