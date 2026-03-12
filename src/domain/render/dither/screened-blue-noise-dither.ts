import type { DitherResult, RGB } from '../../../modules/dither-algorithms/types';
import { generateBlueNoiseTile, rgbToGray, sampleBlueNoise } from '../../../modules/dither-algorithms/utils';
import { ScreenedBlueNoiseOptions } from './screened-blue-noise-options';

/** Screened blue noise - combines halftone screening with blue noise */
export function screenedBlueNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: ScreenedBlueNoiseOptions = {}
): DitherResult {
  const tileSize = options.tileSize ?? 64;
  const seed = options.seed ?? 0;
  const strength = options.strength ?? 100;
  const tile = generateBlueNoiseTile(tileSize, seed);
  const strengthFactor = strength / 100;

  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

  const screenSize = 4;
  const screenPattern = [
    [0.1, 0.5, 0.2, 0.6],
    [0.7, 0.3, 0.8, 0.4],
    [0.2, 0.6, 0.1, 0.5],
    [0.8, 0.4, 0.7, 0.3],
  ];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];

    for (let x = 0; x < width; x++) {
      const idx = x * 3;
      const r = imageData[y][idx];
      const g = imageData[y][idx + 1];
      const b = imageData[y][idx + 2];
      const gray = rgbToGray(r, g, b);

      const screenVal = screenPattern[y % screenSize][x % screenSize];
      const blueNoiseVal = sampleBlueNoise(x, y, tile, tileSize);
      const combinedThreshold = screenVal * 0.6 + blueNoiseVal * 0.4;
      const adjustedThreshold = 0.5 + (combinedThreshold - 0.5) * strengthFactor;

      const isDark = gray < adjustedThreshold;
      matrixRow.push(isDark);
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}
