import { DIFFUSION_KERNELS } from './kernels';
import type { DitherResult } from '../../../modules/dither-algorithms/types';
import { generateBlueNoiseTile, sampleBlueNoise } from '../../../modules/dither-algorithms/utils';
import { BlueNoiseErrorDiffusionOptions } from './blue-noise-error-diffusion-options';
import { copyImageToPixels } from './copy-image-to-pixels';
import { quantizeBNEDPixel } from './quantize-bned-pixel';
import { runDiffusionDither } from './run-diffusion-dither';

/** Blue noise modulated error diffusion */
export function blueNoiseErrorDiffusion(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: BlueNoiseErrorDiffusionOptions = {}
): DitherResult {
  const kernelName = options.kernelName ?? 'floyd_steinberg';
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const tileSize = options.tileSize ?? 64;
  const seed = options.seed ?? 0;
  const kernel = DIFFUSION_KERNELS[kernelName];
  const strengthFactor = strength / 100;
  const step = 1 / (levels - 1);
  const tile = generateBlueNoiseTile(tileSize, seed);

  const pixels = copyImageToPixels(imageData, width, height);
  return runDiffusionDither({
    height,
    kernel,
    leftPixelAt: (x, y) => pixels[y][x],
    pixels,
    quantize: (pixel, x, y) => {
      const blueNoiseVal = sampleBlueNoise(x, y, tile, tileSize);
      const thresholdMod = (blueNoiseVal - 0.5) * 0.3 * strengthFactor;
      return quantizeBNEDPixel(pixel, colorMode, step, strengthFactor, thresholdMod);
    },
    serpentine,
    width,
  });
}
