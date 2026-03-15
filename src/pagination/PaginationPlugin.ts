import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

export const paginationPluginKey = new PluginKey('folioPagination');

// ---------------------------------------------------------------------------
// Page info cache — exposed via the public API in src/api/page-info.ts
// ---------------------------------------------------------------------------

export interface PageInfoEntry {
  index: number;
  top: number;
  height: number;
}

export interface PageInfoData {
  pageCount: number;
  pages: PageInfoEntry[];
}

const PAGE_INFO_KEY = '__folioPageInfo';

export function getPageInfoFromCache(editorDom: HTMLElement): PageInfoData | null {
  return (editorDom as any)[PAGE_INFO_KEY] ?? null;
}

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
  headerEditable: boolean;
  footerEditable: boolean;
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
  let headerContent: string = options.headerHTML;
  let footerContent: string = options.footerHTML;
  let isEditingHeaderFooter = false;

  function schedule(view: EditorView) {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      repaginate(view);
    });
  }

  function repaginate(view: EditorView) {
    if (!overlayContainer || !breakStyleEl) return;

    if (isEditingHeaderFooter) return;

    const editor = view.dom as HTMLElement;
    const parent = editor.parentElement;

    // Re-apply positioning on every cycle (React re-renders may clear inline styles)
    if (parent) {
      parent.style.position = 'relative';
      parent.style.zIndex = '0';
      parent.style.overflowX = 'hidden';
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
    const breaks = findBreaks(children, paddingTop, contentAreaHeight, editor);
    const pageCount = breaks.length + 1;

    // --- Step 3: Inject CSS margins to create real content gaps ---
    let css = '';
    for (const brk of breaks) {
      const nthChild = brk.childIndex + 1;
      if (brk.tableRowIndex !== undefined) {
        const nthRow = brk.tableRowIndex + 1;
        const totalPad = brk.remainingSpace + gapBridge;
        const sel = `.ProseMirror > :nth-child(${nthChild}) table tr:nth-child(${nthRow})`;
        css += `${sel} > td,${sel} > th{padding-bottom:${totalPad}px !important}\n`;
      } else {
        const extra = brk.paraLineBreak ? brk.paraLineBreak.originalMargin : 0;
        const totalMargin = brk.remainingSpace + gapBridge + extra;
        css += `.ProseMirror > :nth-child(${nthChild}){margin-bottom:${totalMargin}px !important}\n`;
      }
    }
    css += `.folio-para-clone{pointer-events:none;user-select:none}\n`;
    if (opts.headerEditable || opts.footerEditable) {
      css += `.folio-header-editable,.folio-footer-editable{cursor:text;border-radius:2px;outline:2px solid transparent;transition:outline 0.15s}\n`;
      css += `.folio-header-editable:hover,.folio-footer-editable:hover{outline:1px dashed #ccc}\n`;
      css += `.folio-header-editable:focus,.folio-footer-editable:focus{outline:2px dashed #4285f4;color:#333}\n`;
      css += `.folio-header-editable:empty::before{content:'';color:#bbb;font-style:italic}\n`;
      css += `.folio-footer-editable:empty::before{content:'';color:#bbb;font-style:italic}\n`;
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
      let effectiveBottom: number;
      if (brk.tableRowIndex !== undefined) {
        const rows = getTableRows(children[brk.childIndex]);
        const breakRow = rows[brk.tableRowIndex];
        const rowBottomAfterInj = offsetRelTo(breakRow, editor) + breakRow.offsetHeight;
        effectiveBottom = rowBottomAfterInj - brk.remainingSpace - gapBridge;
      } else if (brk.paraLineBreak) {
        const fullBottom = children[brk.childIndex].offsetTop + children[brk.childIndex].offsetHeight;
        effectiveBottom = fullBottom - brk.paraLineBreak.overflowHeight;
      } else {
        effectiveBottom = children[brk.childIndex].offsetTop + children[brk.childIndex].offsetHeight;
      }
      const gapY = editorTop + effectiveBottom + brk.remainingSpace + paddingBottom;
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
      if (opts.headerEnabled && (opts.headerEditable || opts.headerHTML)) {
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
        if (opts.headerEditable) {
          header.contentEditable = 'true';
          header.className = 'folio-header-editable';
          header.style.pointerEvents = 'auto';
          header.innerHTML = headerContent;
        } else {
          header.innerHTML = opts.headerHTML;
        }
        overlayContainer.appendChild(header);
      }

      // Footer
      if (opts.footerEnabled && (opts.footerEditable || opts.footerHTML)) {
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
        if (opts.footerEditable) {
          footer.contentEditable = 'true';
          footer.className = 'folio-footer-editable';
          footer.style.pointerEvents = 'auto';
          footer.innerHTML = footerContent;
        } else {
          footer.innerHTML = opts.footerHTML;
        }
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

      // White masks and closing border for table breaks
      if (i < pageCount - 1 && breaks[i].tableRowIndex !== undefined) {
        const maskY = pageY + opts.pageHeight - paddingBottom;
        overlayContainer.appendChild(makeEl({
          position: 'absolute',
          top: `${maskY}px`,
          left: `${editorLeft}px`,
          width: `${editorWidth}px`,
          height: `${paddingBottom}px`,
          background: '#ffffff',
          zIndex: '3',
        }));
        overlayContainer.appendChild(makeEl({
          position: 'absolute',
          top: `${maskY}px`,
          left: `${contentLeft}px`,
          width: `${contentWidth}px`,
          height: '0',
          borderTop: '1px solid #d0d0d0',
          zIndex: '5',
        }));
      }

      // White masks and clone overlay for paragraph breaks
      if (i < pageCount - 1 && breaks[i].paraLineBreak) {
        const maskTop = gapYPositions[i] - breaks[i].remainingSpace - paddingBottom - 2;
        const maskHeight = breaks[i].remainingSpace + paddingBottom + 2;
        overlayContainer.appendChild(makeEl({
          position: 'absolute',
          top: `${maskTop}px`,
          left: `${editorLeft}px`,
          width: `${editorWidth}px`,
          height: `${maskHeight}px`,
          background: '#ffffff',
          zIndex: '3',
        }));
      }

      // Top mask for continuation pages (table or paragraph breaks)
      if (i > 0 && (breaks[i - 1].tableRowIndex !== undefined || breaks[i - 1].paraLineBreak)) {
        const maskOverlap = breaks[i - 1].paraLineBreak ? 4 : 0;
        overlayContainer.appendChild(makeEl({
          position: 'absolute',
          top: `${pageY}px`,
          left: `${editorLeft}px`,
          width: `${editorWidth}px`,
          height: `${paddingTop + maskOverlap}px`,
          background: '#ffffff',
          zIndex: '3',
        }));
      }

      // Clone overlay for paragraph continuation on next page
      if (i > 0 && breaks[i - 1].paraLineBreak) {
        const pb = breaks[i - 1].paraLineBreak!;
        const cloneTop = pageY + paddingTop;

        const wrapper = makeEl({
          position: 'absolute',
          top: `${cloneTop}px`,
          left: `${contentLeft}px`,
          width: `${pb.paraWidth}px`,
          height: `${pb.overflowHeight}px`,
          overflow: 'hidden',
          zIndex: '6',
          background: '#ffffff',
        });
        wrapper.className = 'folio-para-clone';

        const inner = document.createElement('div');
        inner.innerHTML = pb.cloneHtml;
        Object.assign(inner.style, {
          fontSize: pb.fontSize,
          lineHeight: pb.lineHeight,
          fontWeight: pb.fontWeight,
          fontFamily: pb.fontFamily,
          color: pb.color,
          padding: '0',
          marginLeft: '0',
          marginRight: '0',
          marginBottom: '0',
          marginTop: `-${pb.fittingHeight + 2}px`,
        });
        wrapper.appendChild(inner);
        overlayContainer.appendChild(wrapper);

        // Thin strip to clip any sub-pixel bleeding from the fitting lines
        overlayContainer.appendChild(makeEl({
          position: 'absolute',
          top: `${cloneTop}px`,
          left: `${contentLeft}px`,
          width: `${pb.paraWidth}px`,
          height: '3px',
          background: '#ffffff',
          zIndex: '7',
        }));
      }
    }

    const totalHeight = pageStartYs[pageCount - 1] + opts.pageHeight;
    overlayContainer.style.height = `${totalHeight}px`;
    if (pageBackgrounds) pageBackgrounds.style.height = `${totalHeight}px`;

    (editor as any)[PAGE_INFO_KEY] = {
      pageCount,
      pages: pageStartYs.map((y, i) => ({ index: i, top: y, height: opts.pageHeight })),
    } as PageInfoData;

    editor.dispatchEvent(new CustomEvent('foliopagechange', { bubbles: true }));
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

      // Editable header/footer event delegation
      if (options.headerEditable || options.footerEditable) {
        const isHfEditable = (el: HTMLElement) =>
          el.classList.contains('folio-header-editable') || el.classList.contains('folio-footer-editable');

        overlayContainer.addEventListener('focusin', (e) => {
          if (isHfEditable(e.target as HTMLElement)) {
            isEditingHeaderFooter = true;
          }
        });

        overlayContainer.addEventListener('focusout', (e) => {
          const target = e.target as HTMLElement;
          if (!isHfEditable(target)) return;

          // Defer so focusin on a sibling header/footer fires first
          setTimeout(() => {
            const active = document.activeElement as HTMLElement | null;
            if (active && isHfEditable(active)) return;

            isEditingHeaderFooter = false;
            if (target.classList.contains('folio-header-editable')) {
              headerContent = target.innerHTML;
            } else {
              footerContent = target.innerHTML;
            }
            prevDoc = null;
            schedule(view);
          }, 0);
        });

        overlayContainer.addEventListener('input', (e) => {
          const target = e.target as HTMLElement;
          const isHeader = target.classList.contains('folio-header-editable');
          const isFooter = target.classList.contains('folio-footer-editable');
          if (!isHeader && !isFooter) return;

          const html = target.innerHTML;
          const cls = isHeader ? 'folio-header-editable' : 'folio-footer-editable';

          if (isHeader) headerContent = html;
          else footerContent = html;

          overlayContainer!.querySelectorAll(`.${cls}`).forEach(el => {
            if (el !== target) el.innerHTML = html;
          });

          view.dom.dispatchEvent(new CustomEvent(
            isHeader ? 'folioheaderchange' : 'foliofooterchange',
            { bubbles: true, detail: { html } },
          ));
        });

        overlayContainer.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && isHfEditable(e.target as HTMLElement)) {
            (e.target as HTMLElement).blur();
          }
        });
      }

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

interface ParaLineBreak {
  fittingHeight: number;
  overflowHeight: number;
  originalMargin: number;
  cloneHtml: string;
  paraWidth: number;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  fontFamily: string;
  color: string;
}

interface BreakPoint {
  childIndex: number;
  remainingSpace: number;
  tableRowIndex?: number;
  paraLineBreak?: ParaLineBreak;
}

/**
 * Walk the editor's direct block children and find where each page break
 * should go. A break is placed after the last child whose bottom edge fits
 * within the current page's content area. Tables can be split at row boundaries.
 */
function findBreaks(
  children: HTMLElement[],
  firstPageStart: number,
  contentAreaHeight: number,
  editorEl: HTMLElement,
): BreakPoint[] {
  const result: BreakPoint[] = [];
  let startIdx = 0;
  let startRowIdx = 0;
  let searchFrom = firstPageStart;

  for (let safety = 0; safety < 200; safety++) {
    const pageEnd = searchFrom + contentAreaHeight;
    let lastFittingIdx = -1;
    let lastFittingBottom = searchFrom;
    let hitPageBreak = -1;
    let tableBreak: BreakPoint | null = null;

    let paraBreak: BreakPoint | null = null;

    for (let i = startIdx; i < children.length; i++) {
      if (children[i].hasAttribute('data-page-break')) {
        hitPageBreak = i;
        break;
      }

      const bottom = children[i].offsetTop + children[i].offsetHeight;
      if (bottom <= pageEnd) {
        lastFittingIdx = i;
        lastFittingBottom = bottom;
        startRowIdx = 0;
      } else {
        tableBreak = tryTableSplit(
          children[i], i, pageEnd,
          i === startIdx ? startRowIdx : 0,
          editorEl,
        );
        if (!tableBreak) {
          paraBreak = tryParaSplit(children[i], i, pageEnd, editorEl);
        }
        break;
      }
    }

    // Forced page breaks
    if (hitPageBreak >= 0) {
      if (lastFittingIdx >= startIdx) {
        result.push({
          childIndex: lastFittingIdx,
          remainingSpace: Math.max(0, pageEnd - lastFittingBottom),
        });
      }
      startIdx = hitPageBreak + 1;
      startRowIdx = 0;
      if (startIdx >= children.length) break;
      searchFrom = children[startIdx].offsetTop;
      continue;
    }

    // Intra-table break (takes priority — fits more content on this page)
    if (tableBreak) {
      result.push(tableBreak);
      const rows = getTableRows(children[tableBreak.childIndex]);
      const nextRow = (tableBreak.tableRowIndex ?? 0) + 1;
      if (nextRow < rows.length) {
        startIdx = tableBreak.childIndex;
        startRowIdx = nextRow;
        searchFrom = offsetRelTo(rows[nextRow], editorEl);
      } else {
        startIdx = tableBreak.childIndex + 1;
        startRowIdx = 0;
        if (startIdx >= children.length) break;
        searchFrom = children[startIdx].offsetTop;
      }
      continue;
    }

    // Intra-paragraph break (line-level split)
    if (paraBreak) {
      result.push(paraBreak);
      startIdx = paraBreak.childIndex + 1;
      startRowIdx = 0;
      if (startIdx >= children.length) break;
      searchFrom = children[startIdx].offsetTop;
      continue;
    }

    // Normal overflow break
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
    startRowIdx = 0;
    if (startIdx >= children.length) break;
    searchFrom = children[startIdx].offsetTop;
  }

  return result;
}

function tryTableSplit(
  child: HTMLElement,
  childIndex: number,
  pageEnd: number,
  fromRow: number,
  editorEl: HTMLElement,
): BreakPoint | null {
  const rows = getTableRows(child);
  if (rows.length < 2) return null;

  let lastFittingRow = -1;
  let lastFittingRowBottom = 0;

  for (let r = fromRow; r < rows.length; r++) {
    const rowBottom = offsetRelTo(rows[r], editorEl) + rows[r].offsetHeight;
    if (rowBottom <= pageEnd) {
      lastFittingRow = r;
      lastFittingRowBottom = rowBottom;
    } else {
      break;
    }
  }

  if (lastFittingRow < fromRow || lastFittingRow >= rows.length - 1) return null;

  return {
    childIndex,
    tableRowIndex: lastFittingRow,
    remainingSpace: Math.max(0, pageEnd - lastFittingRowBottom),
  };
}

function tryParaSplit(
  child: HTMLElement,
  childIndex: number,
  pageEnd: number,
  editorEl: HTMLElement,
): BreakPoint | null {
  if (child.tagName !== 'P') return null;

  const range = document.createRange();
  range.selectNodeContents(child);
  const rects = Array.from(range.getClientRects());
  range.detach();

  if (rects.length < 2) return null;

  const editorBCR = editorEl.getBoundingClientRect();

  const lines: { top: number; bottom: number }[] = [];
  for (const rect of rects) {
    const relTop = rect.top - editorBCR.top + editorEl.scrollTop;
    const relBottom = rect.bottom - editorBCR.top + editorEl.scrollTop;
    const last = lines[lines.length - 1];
    if (!last || relTop >= last.bottom - 2) {
      lines.push({ top: relTop, bottom: relBottom });
    } else {
      last.bottom = Math.max(last.bottom, relBottom);
    }
  }

  if (lines.length < 2) return null;

  let lastFittingLine = -1;
  for (let l = 0; l < lines.length; l++) {
    if (lines[l].bottom <= pageEnd) {
      lastFittingLine = l;
    } else {
      break;
    }
  }

  if (lastFittingLine < 0 || lastFittingLine >= lines.length - 1) return null;

  const fittingHeight = lines[lastFittingLine].bottom - lines[0].top;
  const totalHeight = lines[lines.length - 1].bottom - lines[0].top;
  const overflowHeight = totalHeight - fittingHeight;
  const remainingSpace = pageEnd - lines[lastFittingLine].bottom;

  const styles = getComputedStyle(child);

  return {
    childIndex,
    remainingSpace: Math.max(0, remainingSpace),
    paraLineBreak: {
      fittingHeight,
      overflowHeight,
      originalMargin: parseFloat(styles.marginBottom) || 0,
      cloneHtml: child.innerHTML,
      paraWidth: child.offsetWidth,
      fontSize: styles.fontSize,
      lineHeight: styles.lineHeight,
      fontWeight: styles.fontWeight,
      fontFamily: styles.fontFamily,
      color: styles.color,
    },
  };
}

function getTableRows(wrapper: HTMLElement): HTMLElement[] {
  const table = wrapper.querySelector('table');
  if (!table) return [];
  const tbody = table.querySelector('tbody') || table;
  return Array.from(tbody.children).filter(
    (el): el is HTMLElement => el.tagName === 'TR',
  );
}

function offsetRelTo(el: HTMLElement, ancestor: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
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
