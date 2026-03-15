export type Unit = 'px' | 'cm' | 'in' | 'mm' | 'pt';

export interface Margin {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageSize {
  name: string;
  width: number;
  height: number;
  unit: Unit;
}

export interface HeaderFooterConfig {
  enabled: boolean;
  height: number;
  render?: () => string;
}

export interface PageNumberConfig {
  show: boolean;
  showTotal: boolean;
  showOnFirstPage: boolean;
  position: 'top' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  format?: (current: number, total: number) => string;
}

export interface FolioConfig {
  pageSize: PageSize | string;
  margins: Margin;
  header: HeaderFooterConfig;
  footer: HeaderFooterConfig;
  pageNumber: PageNumberConfig;
  pageGap: number;
  pageBreakBackground: string;
  debug?: boolean;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface PageMeta {
  pageIndex: number;
  pageCount: number;
}

export interface PaginationState {
  pageCount: number;
  currentPage: number;
  isRecalculating: boolean;
}

export interface SplitResult {
  fits: number;
  overflow: number;
}
