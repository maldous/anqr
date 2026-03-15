import type { DitherResult } from '../../../modules/dither-algorithms/types';
import { generateBlueNoiseTile, sampleBlueNoise } from '../../../modules/dither-algorithms/utils';
import { ScreenedBlueNoiseOptions } from './screened-blue-noise-options';
import { buildBinaryDitherResult } from './build-binary-dither-result';

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

  const screenSize = 4;
  const screenPattern = [
    [0.1, 0.5, 0.2, 0.6],
    [0.7, 0.3, 0.8, 0.4],
    [0.2, 0.6, 0.1, 0.5],
    [0.8, 0.4, 0.7, 0.3],
  ];
  return buildBinaryDitherResult({
    height,
    imageData,
    resolveThreshold: (x, y) => {
      const screenVal = screenPattern[y % screenSize][x % screenSize];
      const blueNoiseVal = sampleBlueNoise(x, y, tile, tileSize);
      const combinedThreshold = screenVal * 0.6 + blueNoiseVal * 0.4;
      return combinedThreshold;
    },
    strengthFactor,
    width,
  });
}
