/**
 * Convert RGBA pixel to grayscale, composited over white.
 *
 * Canvas pixels may be transparent (e.g. background set to 'transparent'
 * or left unpainted). In ImageData those appear as transparent black
 * (0,0,0,0), but visually they render over the page background.
 * For QR detection, treat transparency as light modules by compositing
 * over white.
 */
export function grayAt(pixels: Uint8ClampedArray, idx: number): number {
  const a = pixels[idx + 3] / 255;
  if (a <= 0) return 255;
  if (a >= 1) return (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;

  const inv = 1 - a;
  const r = pixels[idx] * a + 255 * inv;
  const g = pixels[idx + 1] * a + 255 * inv;
  const b = pixels[idx + 2] * a + 255 * inv;
  return (r + g + b) / 3;
}
