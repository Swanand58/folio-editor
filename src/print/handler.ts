/**
 * Triggers the browser print dialog.
 * Relies on the CSS @media print styles already injected by the style system.
 */
export function printDocument(): void {
  window.print();
}

/**
 * Generates a standalone HTML string of the document suitable for
 * opening in a new window and printing.
 *
 * Style content is escaped to prevent injection via `</style>` payloads.
 */
export function generatePrintHTML(
  editorElement: HTMLElement,
  styles: string
): string {
  const safeStyles = styles.replace(/<\//g, '<\\/');
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Print Document</title>
    <style>${safeStyles}</style>
  </head>
  <body>
    ${editorElement.innerHTML}
  </body>
</html>`;
}
