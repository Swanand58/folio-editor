import { describe, it, expect } from 'vitest';
import { formatPageNumber, DEFAULT_HEADER, DEFAULT_FOOTER, DEFAULT_PAGE_NUMBER } from '../layout/header-footer';

describe('formatPageNumber', () => {
  it('formats with total when showTotal is true', () => {
    const config = { ...DEFAULT_PAGE_NUMBER, showTotal: true };
    expect(formatPageNumber(config, 2, 5)).toBe('2 / 5');
  });

  it('formats without total when showTotal is false', () => {
    const config = { ...DEFAULT_PAGE_NUMBER, showTotal: false };
    expect(formatPageNumber(config, 3, 10)).toBe('3');
  });

  it('uses custom format function when provided', () => {
    const config = {
      ...DEFAULT_PAGE_NUMBER,
      format: (c: number, t: number) => `Page ${c} of ${t}`,
    };
    expect(formatPageNumber(config, 1, 3)).toBe('Page 1 of 3');
  });

  it('custom format takes precedence over showTotal', () => {
    const config = {
      ...DEFAULT_PAGE_NUMBER,
      showTotal: false,
      format: (c: number, t: number) => `${c}/${t}`,
    };
    expect(formatPageNumber(config, 2, 4)).toBe('2/4');
  });
});

describe('defaults', () => {
  it('header is disabled by default', () => {
    expect(DEFAULT_HEADER.enabled).toBe(false);
    expect(DEFAULT_HEADER.height).toBe(40);
  });

  it('footer is disabled by default', () => {
    expect(DEFAULT_FOOTER.enabled).toBe(false);
    expect(DEFAULT_FOOTER.height).toBe(40);
  });

  it('page number defaults to bottom center with total', () => {
    expect(DEFAULT_PAGE_NUMBER.show).toBe(true);
    expect(DEFAULT_PAGE_NUMBER.showTotal).toBe(true);
    expect(DEFAULT_PAGE_NUMBER.position).toBe('bottom');
    expect(DEFAULT_PAGE_NUMBER.alignment).toBe('center');
    expect(DEFAULT_PAGE_NUMBER.showOnFirstPage).toBe(false);
  });
});
