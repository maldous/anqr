import { DIFFUSION_KERNELS } from './kernels';
import type { DitherResult } from '../../../modules/dither-algorithms/types';
import { ErrorDiffusionOptions, copyImageToPixels, initDitherResults, getScanParams, quantizeErrorDiffusionPixel } from './error-diffusion._internal';
import { distributeErrorWithKernel } from './distribute-error-with-kernel';

/** Apply error diffusion dithering */
export function errorDiffusion(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: ErrorDiffusionOptions = {}
): DitherResult {
  const kernelName = options.kernelName ?? 'floyd_steinberg';
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const kernel = DIFFUSION_KERNELS[kernelName];
  const strengthFactor = strength / 100;
  const step = 1 / (levels - 1);

  const pixels = copyImageToPixels(imageData, width, height);
  const { resultMatrix, resultColors } = initDitherResults(width, height);

  // Process each pixel
  for (let y = 0; y < height; y++) {
    const { startX, endX, deltaX, leftToRight } = getScanParams(y, width, serpentine);

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const q = quantizeErrorDiffusionPixel(pixels[y][x], colorMode, step, strengthFactor);
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
