import type { HeaderFooterConfig, PageNumberConfig } from '../types';

export const DEFAULT_HEADER: HeaderFooterConfig = {
  enabled: false,
  height: 40,
};

export const DEFAULT_FOOTER: HeaderFooterConfig = {
  enabled: false,
  height: 40,
};

export const DEFAULT_PAGE_NUMBER: PageNumberConfig = {
  show: true,
  showTotal: true,
  showOnFirstPage: false,
  position: 'bottom',
  alignment: 'center',
};

export function formatPageNumber(
  config: PageNumberConfig,
  current: number,
  total: number
): string {
  if (config.format) {
    return config.format(current, total);
  }
  if (config.showTotal) {
    return `${current} / ${total}`;
  }
  return `${current}`;
}
