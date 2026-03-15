import { describe, it, expect } from 'vitest';
import { DEFAULT_MARGINS, getContentHeight, getContentWidth } from '../layout/margins';
import { PAGE_SIZES } from '../layout/presets';

describe('DEFAULT_MARGINS', () => {
  it('has 72px on all sides (1 inch at 96 DPI)', () => {
    expect(DEFAULT_MARGINS).toEqual({
      top: 72,
      bottom: 72,
      left: 72,
      right: 72,
    });
  });
});

describe('getContentHeight', () => {
  it('subtracts margins and header/footer from page height', () => {
    const margins = { top: 72, bottom: 72, left: 72, right: 72 };
    const header = { enabled: true, height: 40 };
    const footer = { enabled: true, height: 40 };

    const result = getContentHeight(PAGE_SIZES.A4, margins, header, footer);
    // A4 height = 297mm ≈ 1122.52px; minus 72+72+40+40 = 898.52
    expect(result).toBeCloseTo(898.52, 1);
  });

  it('ignores disabled header/footer', () => {
    const margins = { top: 72, bottom: 72, left: 72, right: 72 };
    const header = { enabled: false, height: 40 };
    const footer = { enabled: false, height: 40 };

    const withHF = getContentHeight(PAGE_SIZES.A4, margins, { enabled: true, height: 40 }, { enabled: true, height: 40 });
    const withoutHF = getContentHeight(PAGE_SIZES.A4, margins, header, footer);
    expect(withoutHF).toBe(withHF + 80);
  });
});

describe('getContentWidth', () => {
  it('subtracts left and right margins from page width', () => {
    const margins = { top: 72, bottom: 72, left: 72, right: 72 };
    const result = getContentWidth(PAGE_SIZES.A4, margins);
    const expectedPageWidth = Math.round(210 * (96 / 25.4) * 100) / 100;
    expect(result).toBe(expectedPageWidth - 72 - 72);
  });
});
