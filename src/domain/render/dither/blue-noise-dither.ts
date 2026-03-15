import type { DitherResult } from '../../../modules/dither-algorithms/types';
import { generateBlueNoiseTile, sampleBlueNoise } from '../../../modules/dither-algorithms/utils';
import type { BlueNoiseOptions } from './blue-noise-options';
import { buildRowWiseDitherResult } from './build-row-wise-dither-result';
import { quantizeBlueNoisePixel } from './quantize-blue-noise-pixel';

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

  return buildRowWiseDitherResult({
    height,
    resolvePixel: (x, y) => {
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
      return { color: px.color, isDark: px.isDark };
    },
    width,
  });
}
