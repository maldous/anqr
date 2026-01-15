import {A, for, idx, t, threshold, total, w, x, y} from '../shared';
/**
 * Adaptive threshold (Bradley-Roth) using an integral image.
 * Useful when the QR is under shadow/gradient lighting.
 *
 * Returns null when the image is too large (memory guard).
 */
export function createAdaptiveBinaryFromLuma(
  luma: Uint8Array,
  width: number,
  height: number,
  windowSize: number,
  t: number
): boolean[] | null {
  const total = width * height;
  // Guard: integral image is (w+1)*(h+1) uint32 entries.
  // Limit to keep memory predictable in browsers.
  if (total > 6_000_000) return null;

  const w1 = width + 1;
  const integral = new Uint32Array((width + 1) * (height + 1));

  for (let y = 1; y <= height; y++) {
    let rowSum = 0;
    const rowOff = (y - 1) * width;
    const integRow = y * w1;
    const integPrev = (y - 1) * w1;

    for (let x = 1; x <= width; x++) {
      rowSum += luma[rowOff + (x - 1)];
      integral[integRow + x] = integral[integPrev + x] + rowSum;
    }
  }

  const r = Math.max(1, Math.floor(windowSize / 2));
  const binary = new Array<boolean>(total);

  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - r);
    const y2 = Math.min(height - 1, y + r);

    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - r);
      const x2 = Math.min(width - 1, x + r);

      const A = (y1) * w1 + (x1);
      const B = (y1) * w1 + (x2 + 1);
      const C = (y2 + 1) * w1 + (x1);
      const D = (y2 + 1) * w1 + (x2 + 1);

      const sum = integral[D] - integral[B] - integral[C] + integral[A];
      const area = (x2 - x1 + 1) * (y2 - y1 + 1);
      const mean = sum / area;

      const idx = y * width + x;
      const thresh = mean * (1 - t);

      binary[idx] = luma[idx] < thresh;
    }
  }

  return binary;
}

