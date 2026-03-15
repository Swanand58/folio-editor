// Core extensions
export { PageDocument } from './core/PageDocument';
export { FolioExtension } from './core/PageExtension';
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
  PageMeta,
  PaginationState,
  SplitResult,
} from './types';
