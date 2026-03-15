import type { Margin, PageSize, HeaderFooterConfig } from '../types';
import { toPx } from '../utils/units';

export const DEFAULT_MARGINS: Margin = {
  top: 72,
  bottom: 72,
  left: 72,
  right: 72,
};

/**
 * Calculates the usable content area height within a page,
 * accounting for margins, header, and footer.
 */
export function getContentHeight(
  pageSize: PageSize,
  margins: Margin,
  header: HeaderFooterConfig,
  footer: HeaderFooterConfig
): number {
  const pageHeightPx = toPx(pageSize.height, pageSize.unit);
  const headerHeight = header.enabled ? header.height : 0;
  const footerHeight = footer.enabled ? footer.height : 0;
  return pageHeightPx - margins.top - margins.bottom - headerHeight - footerHeight;
}

/**
 * Calculates the usable content area width within a page.
 */
export function getContentWidth(
  pageSize: PageSize,
  margins: Margin
): number {
  const pageWidthPx = toPx(pageSize.width, pageSize.unit);
  return pageWidthPx - margins.left - margins.right;
}
