import { describe, it, expect } from 'vitest';
import { safeColor, esc } from '../core/ChartBlock';

describe('chart color sanitization', () => {
  it('allows valid hex colors', () => {
    expect(safeColor('#ff0000')).toBe('#ff0000');
    expect(safeColor('#abc')).toBe('#abc');
    expect(safeColor('#aabbccdd')).toBe('#aabbccdd');
  });

  it('allows valid rgb/hsl', () => {
    expect(safeColor('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
    expect(safeColor('hsl(120, 50%, 50%)')).toBe('hsl(120, 50%, 50%)');
  });

  it('allows named colors', () => {
    expect(safeColor('red')).toBe('red');
    expect(safeColor('cornflowerblue')).toBe('cornflowerblue');
  });

  it('rejects XSS payloads', () => {
    expect(safeColor('" onload="alert(1)')).toBe('#999');
    expect(safeColor('javascript:alert(1)')).toBe('#999');
    expect(safeColor('<script>alert(1)</script>')).toBe('#999');
    expect(safeColor('red; background: url(evil)')).toBe('#999');
  });
});

describe('esc function', () => {
  it('escapes HTML special characters', () => {
    expect(esc('<script>')).toBe('&lt;script&gt;');
    expect(esc('"hello"')).toBe('&quot;hello&quot;');
    expect(esc("it's")).toBe("it&#39;s");
    expect(esc('a&b')).toBe('a&amp;b');
  });
});
