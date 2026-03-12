import { distributeErrorWithKernel } from './error-diffusion';
import { DIFFUSION_KERNELS } from './kernels';
import type { DitherResult } from '../../../modules/dither-algorithms/types';
import { generateBlueNoiseTile, sampleBlueNoise } from '../../../modules/dither-algorithms/utils';
import { BlueNoiseErrorDiffusionOptions } from './blue-noise-error-diffusion-options';
import { copyImageToPixels } from './copy-image-to-pixels';
import { getScanParams } from './get-scan-params';
import { initDitherResults } from './init-dither-results';
import { quantizeBNEDPixel } from './quantize-bned-pixel';

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
  const { resultMatrix, resultColors } = initDitherResults(width, height);

  for (let y = 0; y < height; y++) {
    const { startX, endX, deltaX, leftToRight } = getScanParams(y, width, serpentine);

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const blueNoiseVal = sampleBlueNoise(x, y, tile, tileSize);
      const thresholdMod = (blueNoiseVal - 0.5) * 0.3 * strengthFactor;
      const q = quantizeBNEDPixel(pixels[y][x], colorMode, step, strengthFactor, thresholdMod);
      resultMatrix[y][x] = q.isDark;
      resultColors[y][x] = q.color;
      distributeErrorWithKernel({
        pixels,
        x,
        y,
        width,
        height,
        errorR: q.errorR,
        errorG: q.errorG,
        errorB: q.errorB,
        kernel,
        leftToRight,
      });
    }
  }

  return { matrix: resultMatrix, colors: resultColors };
}
