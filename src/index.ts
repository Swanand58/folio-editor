// Core extensions
export { PageDocument } from './core/PageDocument';
export { FolioExtension } from './core/PageExtension';
export { PageBreak } from './core/PageBreak';
export type { FolioExtensionOptions } from './core/PageExtension';

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

// Types
export type {
  Unit,
  Margin,
  PageSize,
  HeaderFooterConfig,
  PageNumberConfig,
  FolioConfig,
  DeepPartial,
} from './types';
