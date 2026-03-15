import { describe, it, expect } from 'vitest';
import { toPx, fromPx, convert } from '../utils/units';

describe('toPx', () => {
  it('converts inches to pixels at 96 DPI', () => {
    expect(toPx(1, 'in')).toBe(96);
  });

  it('converts cm to pixels', () => {
    expect(toPx(2.54, 'cm')).toBe(96);
  });

  it('converts mm to pixels', () => {
    expect(toPx(25.4, 'mm')).toBe(96);
  });

  it('converts pt to pixels', () => {
    expect(toPx(72, 'pt')).toBe(96);
  });

  it('passes through px unchanged', () => {
    expect(toPx(100, 'px')).toBe(100);
  });

  it('rounds to 2 decimal places', () => {
    const result = toPx(1, 'mm');
    expect(result).toBe(Math.round((96 / 25.4) * 100) / 100);
  });
});

describe('fromPx', () => {
  it('converts pixels to inches', () => {
    expect(fromPx(96, 'in')).toBe(1);
  });

  it('converts pixels to cm', () => {
    expect(fromPx(96, 'cm')).toBe(2.54);
  });

  it('converts pixels to mm', () => {
    expect(fromPx(96, 'mm')).toBe(25.4);
  });

  it('is the inverse of toPx', () => {
    expect(fromPx(toPx(10, 'in'), 'in')).toBe(10);
    expect(fromPx(toPx(21, 'cm'), 'cm')).toBe(21);
  });
});

describe('convert', () => {
  it('converts inches to cm', () => {
    expect(convert(1, 'in', 'cm')).toBe(2.54);
  });

  it('converts cm to mm', () => {
    expect(convert(1, 'cm', 'mm')).toBe(10);
  });

  it('is identity for same unit', () => {
    expect(convert(72, 'px', 'px')).toBe(72);
    expect(convert(5, 'in', 'in')).toBe(5);
  });
});
