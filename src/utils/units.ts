const DPI = 96;

const PX_PER: Record<string, number> = {
  px: 1,
  in: DPI,
  cm: DPI / 2.54,
  mm: DPI / 25.4,
  pt: DPI / 72,
};

export function toPx(value: number, unit: string): number {
  const factor = PX_PER[unit];
  if (!factor) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return Math.round(value * factor * 100) / 100;
}

export function fromPx(px: number, unit: string): number {
  const factor = PX_PER[unit];
  if (!factor) {
    throw new Error(`Unknown unit: ${unit}`);
  }
  return Math.round((px / factor) * 100) / 100;
}

export function convert(value: number, from: string, to: string): number {
  return fromPx(toPx(value, from), to);
}
