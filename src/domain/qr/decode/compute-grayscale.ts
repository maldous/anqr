// Minimum contrast to consider a block as having real data

/**
 * Convert a single RGBA pixel to grayscale, compositing over white for transparent pixels.
 *
 * @param pixels - RGBA pixel data
 * @param idx - Index into the pixel data (start of the 4-byte RGBA group)
 * @returns Grayscale value 0–255
 */
export function computeGrayscale(pixels: Uint8ClampedArray, idx: number): number {
  const a = pixels[idx + 3] / 255;
  if (a <= 0) {
    return 255;
  }
  if (a >= 1) {
    return (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
  }
  const inv = 1 - a;
  const r = pixels[idx] * a + 255 * inv;
  const g = pixels[idx + 1] * a + 255 * inv;
  const b = pixels[idx + 2] * a + 255 * inv;
  return (r + g + b) / 3;
}
