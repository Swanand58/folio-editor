/**
 * Triggers the browser print dialog.
 * Relies on the CSS @media print styles already injected by the style system.
 * Headers, footers, and page numbers appear via position:fixed elements and
 * @page margin boxes created by the pagination plugin.
 */
export function printDocument(): void {
  window.print();
}

export interface PrintHTMLOptions {
  headerHTML?: string;
  footerHTML?: string;
  showPageNumber?: boolean;
  pageNumberAlignment?: 'left' | 'center' | 'right';
  pageNumberPosition?: 'top' | 'bottom';
}

/**
 * Generates a standalone HTML string of the document suitable for
 * opening in a new window and printing.
 *
 * Style content is escaped to prevent injection via `</style>` payloads.
 * When header/footer/pageNumber options are provided, they are included
 * as position:fixed elements that repeat on every printed page.
 */
export function generatePrintHTML(
  editorElement: HTMLElement,
  styles: string,
  options?: PrintHTMLOptions,
): string {
  const safeStyles = styles.replace(/<\//g, '<\\/');
  const hdr = options?.headerHTML
    ? `<div style="position:fixed;top:5mm;left:15mm;right:15mm;text-align:center;font-size:11px;color:#999;font-family:-apple-system,sans-serif">${options.headerHTML}</div>`
    : '';
  const ftr = options?.footerHTML
    ? `<div style="position:fixed;bottom:5mm;left:15mm;right:15mm;text-align:center;font-size:11px;color:#999;font-family:-apple-system,sans-serif">${options.footerHTML}</div>`
    : '';

  let pageNumCSS = '';
  if (options?.showPageNumber) {
    const align = options.pageNumberAlignment ?? 'center';
    const pos = options.pageNumberPosition ?? 'bottom';
    const slot = `@${pos}-${align}`;
    pageNumCSS = `@page { ${slot} { content: counter(page) " / " counter(pages); font-size: 11px; color: #999; } }`;
  }

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Print Document</title>
    <style>${safeStyles}${pageNumCSS ? '\n' + pageNumCSS : ''}</style>
  </head>
  <body>
    ${hdr}${ftr}
    ${editorElement.innerHTML}
  </body>
</html>`;
}
