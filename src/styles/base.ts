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

  const paddingTop = config.margins.top + (config.header.enabled ? config.header.height : 0);
  const paddingBottom = config.margins.bottom + (config.footer.enabled ? config.footer.height : 0);

  return /* css */ `
    .ProseMirror {
      width: ${pageWidthPx}px;
      margin: 0 auto;
      padding: ${paddingTop}px ${config.margins.right}px ${paddingBottom}px ${config.margins.left}px;
      background: transparent;
      position: relative;
      box-sizing: border-box;
      outline: none;
      line-height: 1.6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      color: #1a1a1a;
      min-height: ${pageHeightPx}px;
    }

    .ProseMirror:focus {
      outline: none;
    }

    .folio-overlays {
      pointer-events: none;
    }

    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      .ProseMirror {
        background: white !important;
        width: 100% !important;
      }
      .folio-overlays,
      .folio-page-backgrounds {
        display: none !important;
      }
      @page {
        size: ${config.pageSize.width}${config.pageSize.unit} ${config.pageSize.height}${config.pageSize.unit};
        margin: ${config.margins.top}px ${config.margins.right}px ${config.margins.bottom}px ${config.margins.left}px;
      }
    }

    /* Typography */
    .ProseMirror p { margin: 0 0 8px 0; }
    .ProseMirror h1 { font-size: 2em; margin: 0.67em 0; font-weight: bold; }
    .ProseMirror h2 { font-size: 1.5em; margin: 0.75em 0; font-weight: bold; }
    .ProseMirror h3 { font-size: 1.17em; margin: 0.83em 0; font-weight: bold; }
    .ProseMirror h4 { font-size: 1em; margin: 1em 0; font-weight: bold; }
    .ProseMirror h5 { font-size: 0.83em; margin: 1.17em 0; font-weight: bold; }
    .ProseMirror h6 { font-size: 0.67em; margin: 1.33em 0; font-weight: bold; }

    .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 8px 0; }
    .ProseMirror li { margin: 4px 0; }

    .ProseMirror table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    .ProseMirror th, .ProseMirror td { border: 1px solid #d0d0d0; padding: 8px 12px; text-align: left; position: relative; }
    .ProseMirror th { background: #f5f5f5; font-weight: 600; }

    .ProseMirror img { max-width: 100%; height: auto; }
    .ProseMirror blockquote { border-left: 3px solid #d0d0d0; padding-left: 16px; margin: 12px 0; color: #666; }
    .ProseMirror hr { border: none; border-top: 1px solid #d0d0d0; margin: 16px 0; }
    .ProseMirror code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    .ProseMirror pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; margin: 12px 0; }
    .ProseMirror pre code { background: none; padding: 0; }

    .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; background: #adf; pointer-events: none; }
    .tableWrapper { overflow-x: auto; }
    .resize-cursor { cursor: ew-resize; cursor: col-resize; }
    .selectedCell::after { z-index: 2; position: absolute; content: ""; left: 0; right: 0; top: 0; bottom: 0; background: rgba(200, 200, 255, 0.4); pointer-events: none; }
  `;
}
