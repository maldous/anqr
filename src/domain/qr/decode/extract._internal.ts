import { createLogger } from '../../../infra/logging/logger';

export const qrDecoderLog = createLogger('DECODER');

// Minimum contrast to consider a block as having real data

/**
 * Convert a single RGBA pixel to grayscale, compositing over white for transparent pixels.
 *
 * @param pixels - RGBA pixel data
 * @param idx - Index into the pixel data (start of the 4-byte RGBA group)
 * @returns Grayscale value 0–255
 */
function computeGrayscale(pixels: Uint8ClampedArray, idx: number): number {
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

/**
 * Sample a single pixel from the image at the given coordinates
 * Composites over white for transparent pixels
 */
function sampleSinglePixel(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
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

/**
 * Compare a single module in the matrix against the expected finder pattern value
 * and record the result.
 *
 * @returns true if the module matched, false otherwise
 */
function compareFinderModule(
  matrix: boolean[][],
  finderPattern: number[][],
  row: number,
  col: number,
  rowOffset: number,
  colOffset: number,
  errors: string[]
): boolean {
  const expected = finderPattern[row][col] === 1;
  const actual = matrix[rowOffset + row]?.[colOffset + col] ?? false;
  if (expected === actual) {
    return true;
  }
  if (errors.length < 5) {
    errors.push(
      `(${rowOffset + row},${colOffset + col}): expected ${expected ? 'dark' : 'light'}, got ${actual ? 'dark' : 'light'}`
    );
  }
  return false;
}

export function validateFinderRegion(
  matrix: boolean[][],
  finderPattern: number[][],
  rowOffset: number,
  colOffset: number
): { matches: number; mismatches: number; errors: string[] } {
  let matches = 0;
  let mismatches = 0;
  const errors: string[] = [];
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      if (compareFinderModule(matrix, finderPattern, row, col, rowOffset, colOffset, errors)) {
        matches++;
      } else {
        mismatches++;
      }
    }
  }
  return { matches, mismatches, errors };
}

export { computeGrayscale, sampleSinglePixel, compareFinderModule };
