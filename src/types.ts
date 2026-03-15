/** Supported CSS length units for page dimensions. */
export type Unit = 'px' | 'cm' | 'in' | 'mm' | 'pt';

/**
 * Preset page size names accepted by {@link FolioConfig.pageSize}.
 * Pass one of these strings instead of a custom {@link PageSize} object.
 */
export type PageSizeName = 'A3' | 'A4' | 'A5' | 'LETTER' | 'LEGAL' | 'TABLOID';

/**
 * Page margins in **pixels**.
 *
 * @example
 * ```ts
 * const margins: Margin = { top: 72, bottom: 72, left: 72, right: 72 };
 * ```
 */
export interface Margin {
  /** Top margin in pixels. */
  top: number;
  /** Bottom margin in pixels. */
  bottom: number;
  /** Left margin in pixels. */
  left: number;
  /** Right margin in pixels. */
  right: number;
}

/**
 * Describes a physical page size.
 * Width and height are in the unit specified by {@link PageSize.unit}.
 */
export interface PageSize {
  /** Display name (e.g. "A4", "US Letter"). */
  name: string;
  /** Page width in the given {@link unit}. */
  width: number;
  /** Page height in the given {@link unit}. */
  height: number;
  /** The CSS length unit for width/height. */
  unit: Unit;
}

/** Configuration for a header or footer region. */
export interface HeaderFooterConfig {
  /** Whether to display this region. */
  enabled: boolean;
  /** Region height in pixels. */
  height: number;
  /** Returns an HTML string rendered into every page's header/footer. */
  render?: () => string;
  /** When `true`, the region becomes `contentEditable` (Google Docs style). */
  editable?: boolean;
}

/** Configuration for page number display. */
export interface PageNumberConfig {
  /** Whether to show page numbers. */
  show: boolean;
  /** Show total page count (e.g. "1 / 3"). */
  showTotal: boolean;
  /** Show page number on the first page. */
  showOnFirstPage: boolean;
  /** Vertical position. */
  position: 'top' | 'bottom';
  /** Horizontal alignment. */
  alignment: 'left' | 'center' | 'right';
  /** Custom format function — receives 1-indexed current and total. */
  format?: (current: number, total: number) => string;
}

/** Top-level configuration object for the Folio pagination extension. */
export interface FolioConfig {
  /**
   * Page size — pass a preset name (`'A4'`, `'LETTER'`, …) or a custom
   * {@link PageSize} object.
   */
  pageSize: PageSize | PageSizeName;
  /** Page margins in pixels. */
  margins: Margin;
  /** Header region configuration. */
  header: HeaderFooterConfig;
  /** Footer region configuration. */
  footer: HeaderFooterConfig;
  /** Page number configuration. */
  pageNumber: PageNumberConfig;
  /** Gap between visual pages in pixels. @defaultValue 40 */
  pageGap: number;
  /** Background colour shown between pages. @defaultValue '#e8e8e8' */
  pageBreakBackground: string;
  /** Enable visual debug outlines. */
  debug?: boolean;
}

/**
 * Makes every property in `T` (and nested objects) optional.
 * @internal — used by {@link FolioExtensionOptions}; not part of the public API.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
