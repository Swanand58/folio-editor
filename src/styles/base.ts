import type { PageSize, Margin, HeaderFooterConfig, PageNumberConfig } from '../types';
import { toPx } from '../utils/units';

interface StyleConfig {
  pageSize: PageSize;
  margins: Margin;
  header: HeaderFooterConfig;
  footer: HeaderFooterConfig;
  pageNumber: PageNumberConfig;
  pageGap: number;
  pageBreakBackground: string;
}

export function generateStyles(config: StyleConfig): string {
  const pageWidthPx = toPx(config.pageSize.width, config.pageSize.unit);
  const pageHeightPx = toPx(config.pageSize.height, config.pageSize.unit);

  return /* css */ `
    .ProseMirror {
      background: ${config.pageBreakBackground};
      padding: ${config.pageGap}px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${config.pageGap}px;
      min-height: 100vh;
    }

    .ProseMirror:focus {
      outline: none;
    }

    .folio-page {
      background: #ffffff;
      width: ${pageWidthPx}px;
      min-height: ${pageHeightPx}px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
      position: relative;
      box-sizing: border-box;
      overflow: hidden;
    }

    .folio-page:first-child {
      margin-top: 0;
    }

    .folio-header {
      position: absolute;
      top: 0;
      left: ${config.margins.left}px;
      right: ${config.margins.right}px;
      height: ${config.header.height}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #666;
      pointer-events: none;
      box-sizing: border-box;
      padding-top: ${Math.max(config.margins.top - config.header.height, 8)}px;
    }

    .folio-footer {
      position: absolute;
      bottom: 0;
      left: ${config.margins.left}px;
      right: ${config.margins.right}px;
      height: ${config.footer.height}px;
      display: flex;
      align-items: center;
      font-size: 11px;
      color: #666;
      pointer-events: none;
      box-sizing: border-box;
      padding-bottom: ${Math.max(config.margins.bottom - config.footer.height, 8)}px;
    }

    .folio-footer[data-align="left"] { justify-content: flex-start; }
    .folio-footer[data-align="center"] { justify-content: center; }
    .folio-footer[data-align="right"] { justify-content: flex-end; }

    .folio-page-number {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      color: #999;
    }

    /* Print styles */
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }

      .ProseMirror {
        background: white !important;
        padding: 0 !important;
        gap: 0 !important;
      }

      .folio-page {
        box-shadow: none !important;
        page-break-after: always;
        break-after: page;
        margin: 0 !important;
        border: none !important;
        width: 100% !important;
        min-height: 100vh !important;
      }

      .folio-page:last-child {
        page-break-after: auto;
        break-after: auto;
      }

      @page {
        size: ${config.pageSize.width}${config.pageSize.unit} ${config.pageSize.height}${config.pageSize.unit};
        margin: 0;
      }
    }

    /* Default typography inside pages */
    .folio-page p {
      margin: 0 0 8px 0;
      line-height: 1.6;
    }

    .folio-page h1 { font-size: 2em; margin: 0.67em 0; font-weight: bold; }
    .folio-page h2 { font-size: 1.5em; margin: 0.75em 0; font-weight: bold; }
    .folio-page h3 { font-size: 1.17em; margin: 0.83em 0; font-weight: bold; }
    .folio-page h4 { font-size: 1em; margin: 1em 0; font-weight: bold; }
    .folio-page h5 { font-size: 0.83em; margin: 1.17em 0; font-weight: bold; }
    .folio-page h6 { font-size: 0.67em; margin: 1.33em 0; font-weight: bold; }

    .folio-page ul, .folio-page ol {
      padding-left: 24px;
      margin: 8px 0;
    }

    .folio-page li {
      margin: 4px 0;
    }

    .folio-page table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
    }

    .folio-page th,
    .folio-page td {
      border: 1px solid #d0d0d0;
      padding: 8px 12px;
      text-align: left;
    }

    .folio-page th {
      background: #f5f5f5;
      font-weight: 600;
    }

    .folio-page img {
      max-width: 100%;
      height: auto;
    }

    .folio-page blockquote {
      border-left: 3px solid #d0d0d0;
      padding-left: 16px;
      margin: 12px 0;
      color: #666;
    }

    .folio-page hr {
      border: none;
      border-top: 1px solid #d0d0d0;
      margin: 16px 0;
    }

    .folio-page code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }

    .folio-page pre {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 12px 0;
    }

    .folio-page pre code {
      background: none;
      padding: 0;
    }
  `;
}
