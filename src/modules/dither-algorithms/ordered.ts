/**
 * Ordered Dithering Algorithms
 */

import { createLogger } from '../../lib/logger';
import { BAYER_2, BAYER_4, BAYER_8 } from './matrices';
import type { DitherResult, RGB } from './types';
import { clamp01, rgbToGray } from './utils';

const _log = createLogger('DITHER');

/** Apply ordered (threshold) dithering */
export function orderedDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  matrix: number[][],
  levels: number = 2,
  strength: number = 100
): DitherResult {
  const matrixSize = matrix.length;
  const maxVal = matrixSize * matrixSize;
  const strengthFactor = strength / 100;

  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];

    for (let x = 0; x < width; x++) {
      const mx = x % matrixSize;
      const my = y % matrixSize;
      const threshold = (matrix[my][mx] + 0.5) / maxVal;

      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      // Apply threshold with strength blending
      const adjustedThreshold = 0.5 + (threshold - 0.5) * strengthFactor;
      const isDark = gray < adjustedThreshold;

      matrixRow.push(isDark);

      // Quantize color
      const step = 1 / (levels - 1);
      const newR = Math.round(r / step) * step;
      const newG = Math.round(g / step) * step;
      const newB = Math.round(b / step) * step;

      colorRow.push({
        r: Math.round(clamp01(newR) * 255),
        g: Math.round(clamp01(newG) * 255),
        b: Math.round(clamp01(newB) * 255),
      });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}

/** Apply Bayer ordered dithering */
export function bayerDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  size: 2 | 4 | 8 = 4,
  levels: number = 2,
  strength: number = 100
): DitherResult {
  const matrix = (() => {
    if (size === 2) return BAYER_2;
    if (size === 4) return BAYER_4;
    return BAYER_8;
  })();
  return orderedDither(imageData, width, height, matrix, levels, strength);
}
