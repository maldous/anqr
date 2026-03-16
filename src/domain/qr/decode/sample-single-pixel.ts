import { computeGrayscale } from "./compute-grayscale";

/**
 * Sample a single pixel from the image at the given coordinates
 * Composites over white for transparent pixels
 */
export function sampleSinglePixel(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
): number {
  const ix = Math.round(x);
  const iy = Math.round(y);

  if (ix < 0 || ix >= width || iy < 0 || iy >= height) {
    return 255; // Out of bounds = white
  }

  const idx = (iy * width + ix) * 4;

  // Composite over white so transparent pixels are treated as light modules.
  return computeGrayscale(pixels, idx);
}
