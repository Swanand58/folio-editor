import { describe, it, expect } from 'vitest';
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from '../layout/presets';

describe('PAGE_SIZES', () => {
  it('contains all standard sizes', () => {
    expect(PAGE_SIZES).toHaveProperty('A3');
    expect(PAGE_SIZES).toHaveProperty('A4');
    expect(PAGE_SIZES).toHaveProperty('A5');
    expect(PAGE_SIZES).toHaveProperty('LETTER');
    expect(PAGE_SIZES).toHaveProperty('LEGAL');
    expect(PAGE_SIZES).toHaveProperty('TABLOID');
  });

  it('A4 has correct dimensions', () => {
    expect(PAGE_SIZES.A4).toEqual({
      name: 'A4',
      width: 210,
      height: 297,
      unit: 'mm',
    });
  });

  it('US Letter uses inches', () => {
    expect(PAGE_SIZES.LETTER.unit).toBe('in');
    expect(PAGE_SIZES.LETTER.width).toBe(8.5);
    expect(PAGE_SIZES.LETTER.height).toBe(11);
  });

  it('all sizes have required fields', () => {
    for (const size of Object.values(PAGE_SIZES)) {
      expect(size.name).toBeTruthy();
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
      expect(['px', 'cm', 'in', 'mm', 'pt']).toContain(size.unit);
      expect(size.height).toBeGreaterThan(size.width); // portrait
    }
  });
});

describe('DEFAULT_PAGE_SIZE', () => {
  it('defaults to A4', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(PAGE_SIZES.A4);
  });
});
