import {LUMA_B, LUMA_G, LUMA_R, b, idx} from '../shared';

export function lumaAt(data: Uint8ClampedArray, idx: number): number {
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  const a = data[idx + 3];

  if (a === 255) {
    return Math.round((r * LUMA_R + g * LUMA_G + b * LUMA_B) / 1000);
  }

  if (a === 0) {
    return 255; // fully transparent -> white background
  }

  // Composite onto white: out = src*a + 255*(1-a)
  const inv = 255 - a;
  const r2 = Math.round((r * a + 255 * inv) / 255);
  const g2 = Math.round((g * a + 255 * inv) / 255);
  const b2 = Math.round((b * a + 255 * inv) / 255);
  return Math.round((r2 * LUMA_R + g2 * LUMA_G + b2 * LUMA_B) / 1000);
}

