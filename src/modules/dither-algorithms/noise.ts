/**
 * Noise-Based Dithering Algorithms
 */

import { createLogger } from '../../lib/logger';
import type { ColorMode, DitherResult } from './types';
import { clamp01, createRNG, rgbToGray } from './utils';

const _log = createLogger('DITHER');

/** Apply white noise dithering */
export function whiteNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  seed: number = 0,
  strength: number = 100,
  _colorMode: ColorMode = 'bw'
): DitherResult {
  const rng = createRNG(seed);
  const strengthFactor = strength / 100;

  const resultMatrix: boolean[][] = [];
  const resultColors: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: { r: number; g: number; b: number }[] = [];

    for (let x = 0; x < width; x++) {
      const threshold = rng();
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      const adjustedThreshold = 0.5 + (threshold - 0.5) * strengthFactor;
      const isDark = gray < adjustedThreshold;

      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}

/** Apply Gaussian noise dithering */
export function gaussianNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  seed: number = 0,
  strength: number = 100,
  _colorMode: ColorMode = 'bw'
): DitherResult {
  const rng = createRNG(seed);
  const strengthFactor = strength / 100;

  // Box-Muller transform for Gaussian distribution
  const gaussianRandom = (): number => {
    const u1 = rng() || 0.0001;
    const u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 0.2 + 0.5;
  };

  const resultMatrix: boolean[][] = [];
  const resultColors: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: { r: number; g: number; b: number }[] = [];

    for (let x = 0; x < width; x++) {
      const threshold = clamp01(gaussianRandom());
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      const adjustedThreshold = 0.5 + (threshold - 0.5) * strengthFactor;
      const isDark = gray < adjustedThreshold;

      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}

/** Apply triangular noise dithering (TPDF) */
export function triangularNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  seed: number = 0,
  strength: number = 100,
  _colorMode: ColorMode = 'bw'
): DitherResult {
  const rng = createRNG(seed);
  const strengthFactor = strength / 100;

  // Triangular distribution (sum of two uniform)
  const triangularRandom = (): number => {
    return (rng() + rng()) / 2;
  };

  const resultMatrix: boolean[][] = [];
  const resultColors: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: { r: number; g: number; b: number }[] = [];

    for (let x = 0; x < width; x++) {
      const threshold = triangularRandom();
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      const adjustedThreshold = 0.5 + (threshold - 0.5) * strengthFactor;
      const isDark = gray < adjustedThreshold;

      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}
