import { distributeErrorWithKernel } from './error-diffusion';
import { DIFFUSION_KERNELS } from './kernels';
import type { DitherResult } from '../../../modules/dither-algorithms/types';
import { computeSobelEdgeMap } from './compute-sobel-edge-map';
import { copyImageToPixels } from './copy-image-to-pixels';
import { EdgeAwareDitherOptions } from './edge-aware-dither-options';
import { getScanParams } from './get-scan-params';
import { initDitherResults } from './init-dither-results';
import { quantizeEdgeAwarePixel } from './quantize-edge-aware-pixel';

/** Edge-aware dithering - reduces error diffusion across edges */
export function edgeAwareDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: EdgeAwareDitherOptions = {}
): DitherResult {
  const kernelName = options.kernelName ?? 'floyd_steinberg';
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const kernel = DIFFUSION_KERNELS[kernelName];
  const strengthFactor = strength / 100;
  const step = 1 / (levels - 1);

  const edgeMap = computeSobelEdgeMap(imageData, width, height);
  const pixels = copyImageToPixels(imageData, width, height);
  const { resultMatrix, resultColors } = initDitherResults(width, height);

  for (let y = 0; y < height; y++) {
    const { startX, endX, deltaX, leftToRight } = getScanParams(y, width, serpentine);

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const edgeFactor = 1 - edgeMap[y][x] * 0.8;
      const q = quantizeEdgeAwarePixel(pixels[y][x], colorMode, step, strengthFactor, edgeFactor);
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
