import {dx, dy, x, y} from '../shared';
import { lumaAt } from '../luma/lumaAt';

export function samplePixelGray(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): number | null {
  if (x < 0 || x > width - 1 || y < 0 || y > height - 1) return null;

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);

  const dx = x - x0;
  const dy = y - y0;

  const idx00 = (y0 * width + x0) * 4;
  const idx10 = (y0 * width + x1) * 4;
  const idx01 = (y1 * width + x0) * 4;
  const idx11 = (y1 * width + x1) * 4;

  const g00 = lumaAt(data, idx00);
  const g10 = lumaAt(data, idx10);
  const g01 = lumaAt(data, idx01);
  const g11 = lumaAt(data, idx11);

  // Bilinear interpolation
  const gx0 = g00 * (1 - dx) + g10 * dx;
  const gx1 = g01 * (1 - dx) + g11 * dx;
  return gx0 * (1 - dy) + gx1 * dy;
}

