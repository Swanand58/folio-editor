import type { Unit } from '../types';

const DPI = 96;

const PX_PER: Record<Unit, number> = {
  px: 1,
  in: DPI,
  cm: DPI / 2.54,
  mm: DPI / 25.4,
  pt: DPI / 72,
};

/** Convert a value in the given unit to pixels. */
export function toPx(value: number, unit: Unit): number {
  const factor = PX_PER[unit];
  return Math.round(value * factor * 100) / 100;
}

/** Convert a pixel value to the given unit. */
export function fromPx(px: number, unit: Unit): number {
  const factor = PX_PER[unit];
  return Math.round((px / factor) * 100) / 100;
}

/** Convert a value from one unit to another. */
export function convert(value: number, from: Unit, to: Unit): number {
  return fromPx(toPx(value, from), to);
}
