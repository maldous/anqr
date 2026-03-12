import type { DitherResult, RGB } from '../../../modules/dither-algorithms/types';
import { generateBlueNoiseTile, sampleBlueNoise } from '../../../modules/dither-algorithms/utils';
import { BlueNoiseOptions, quantizeBlueNoisePixel } from './advanced._internal';

/** Apply blue noise threshold dithering */
export function blueNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: BlueNoiseOptions = {}
): DitherResult {
  const tileSize = options.tileSize ?? 64;
  const seed = options.seed ?? 0;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const tile = generateBlueNoiseTile(tileSize, seed);
  const strengthFactor = strength / 100;

  const resultMatrix: boolean[][] = [];
  const resultColors: RGB[][] = [];

  for (let y = 0; y < height; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];

    for (let x = 0; x < width; x++) {
      const threshold = sampleBlueNoise(x, y, tile, tileSize);
      const idx = x * 3;
      const px = quantizeBlueNoisePixel(
        imageData[y][idx],
        imageData[y][idx + 1],
        imageData[y][idx + 2],
        threshold,
        strengthFactor,
        colorMode,
        levels
      );
      matrixRow.push(px.isDark);
      colorRow.push(px.color);
    }

    resultMatrix.push(matrixRow);
    resultColors.push(colorRow);
  }

  return { matrix: resultMatrix, colors: resultColors };
}
