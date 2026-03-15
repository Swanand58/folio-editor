import type { PageSize, PageSizeName } from '../types';

export const PAGE_SIZES: Record<PageSizeName, PageSize> = {
  A3: {
    name: 'A3',
    width: 297,
    height: 420,
    unit: 'mm',
  },
  A4: {
    name: 'A4',
    width: 210,
    height: 297,
    unit: 'mm',
  },
  A5: {
    name: 'A5',
    width: 148,
    height: 210,
    unit: 'mm',
  },
  LETTER: {
    name: 'US Letter',
    width: 8.5,
    height: 11,
    unit: 'in',
  },
  LEGAL: {
    name: 'US Legal',
    width: 8.5,
    height: 14,
    unit: 'in',
  },
  TABLOID: {
    name: 'Tabloid',
    width: 11,
    height: 17,
    unit: 'in',
  },
};

export const DEFAULT_PAGE_SIZE = PAGE_SIZES.A4;
