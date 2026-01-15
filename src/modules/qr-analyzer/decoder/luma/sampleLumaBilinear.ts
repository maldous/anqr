import {dx, dy, value, x, y} from '../shared';
/**
 * Sample a single pixel and return grayscale value
 */
/**
 * Bilinear sampling from a precomputed luma buffer.
 * Avoids repeated RGBA->luma work in hot loops.
 */
export function sampleLumaBilinear(
  luma: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number
): number | null {
  if (x < 0 || x > width - 1 || y < 0 || y > height - 1) return null;

  // x,y are non-negative here, so bitwise-or is a fast floor.
  const x0 = x | 0;
  const y0 = y | 0;
  const x1 = x0 + 1 < width ? x0 + 1 : x0;
  const y1 = y0 + 1 < height ? y0 + 1 : y0;

  const dx = x - x0;
  const dy = y - y0;

  const i00 = y0 * width + x0;
  const i10 = y0 * width + x1;
  const i01 = y1 * width + x0;
  const i11 = y1 * width + x1;

  const g00 = luma[i00];
  const g10 = luma[i10];
  const g01 = luma[i01];
  const g11 = luma[i11];

  const gx0 = g00 + (g10 - g00) * dx;
  const gx1 = g01 + (g11 - g01) * dx;
  return gx0 + (gx1 - gx0) * dy;
}

