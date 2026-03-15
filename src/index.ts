// Core extensions
export { PageDocument } from './core/PageDocument';
export { FolioExtension } from './core/PageExtension';
export { PageBreak } from './core/PageBreak';
export { SvgBlock } from './core/SvgBlock';
export { ChartBlock } from './core/ChartBlock';
export { MathBlock } from './core/MathBlock';
export { TableOfContents } from './core/TableOfContents';
export type { FolioExtensionOptions } from './core/PageExtension';
export type { ChartConfig } from './core/ChartBlock';
export type { MathBlockOptions } from './core/MathBlock';

// Layout
export { PAGE_SIZES, DEFAULT_PAGE_SIZE } from './layout/presets';
export { DEFAULT_MARGINS, getContentHeight, getContentWidth } from './layout/margins';
export {
  DEFAULT_HEADER,
  DEFAULT_FOOTER,
  DEFAULT_PAGE_NUMBER,
  formatPageNumber,
} from './layout/header-footer';

// Pagination
export { paginationPluginKey } from './pagination/PaginationPlugin';

// Page State API
export { getPageInfo, getCurrentPage, getVisiblePage, getActivePage, scrollToPage } from './api/page-info';
export type { PageInfoData, PageInfoEntry } from './api/page-info';

// Print
export { printDocument, generatePrintHTML } from './print/handler';

// Utils
export { toPx, fromPx, convert } from './utils/units';

// DOM Event names — use these instead of raw strings
export const FOLIO_PAGE_CHANGE = 'foliopagechange' as const;
export const FOLIO_HEADER_CHANGE = 'folioheaderchange' as const;
export const FOLIO_FOOTER_CHANGE = 'foliofooterchange' as const;

// Types
export type {
  Unit,
  PageSizeName,
  Margin,
  PageSize,
  HeaderFooterConfig,
  PageNumberConfig,
  FolioConfig,
} from './types';
