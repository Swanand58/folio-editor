import type { PageSize } from '../types';

/**
 * Generates additional print-specific CSS that can be injected
 * when the user wants to customize print behavior beyond defaults.
 */
export function generatePrintCSS(pageSize: PageSize): string {
  return /* css */ `
    @media print {
      @page {
        size: ${pageSize.width}${pageSize.unit} ${pageSize.height}${pageSize.unit};
        margin: 0;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;
}
