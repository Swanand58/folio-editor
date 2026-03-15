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
 */
export function generatePrintHTML(
  editorElement: HTMLElement,
  styles: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Print Document</title>
        <style>${styles}</style>
      </head>
      <body>
        ${editorElement.innerHTML}
      </body>
    </html>
  `;
}
