import { distributeErrorWithKernel } from './error-diffusion';
import { DIFFUSION_KERNELS } from './kernels';
import type { DitherResult } from '../../../modules/dither-algorithms/types';
import { PerceptualDitherOptions, copyImageToPixels, initDitherResults, getScanParams, quantizePerceptualPixel } from './advanced._internal';

/** Perceptual dithering - uses perceptual luminance weighting */
export function perceptualDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: PerceptualDitherOptions = {}
): DitherResult {
  const kernelName = options.kernelName ?? 'floyd_steinberg';
  const serpentine = options.serpentine ?? true;
  const levels = options.levels ?? 2;
  const strength = options.strength ?? 100;
  const colorMode = options.colorMode ?? 'bw';
  const kernel = DIFFUSION_KERNELS[kernelName];
  const strengthFactor = strength / 100;
  const step = 1 / (levels - 1);

  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const toSRGB = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);

  const pixels = copyImageToPixels(imageData, width, height, (r, g, b) => ({
    r: toLinear(r),
    g: toLinear(g),
    b: toLinear(b),
  }));
  const { resultMatrix, resultColors } = initDitherResults(width, height);

  for (let y = 0; y < height; y++) {
    const { startX, endX, deltaX, leftToRight } = getScanParams(y, width, serpentine);

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const q = quantizePerceptualPixel(pixels[y][x], colorMode, step, strengthFactor, toSRGB);
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
