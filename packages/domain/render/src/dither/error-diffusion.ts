export { distributeErrorWithKernel } from "./distribute-error-with-kernel";

import type { DitherResult } from "../dither-algorithms/types";
import { resolveDiffusionDitherOptions } from "./diffusion-dither-options";
import type { ErrorDiffusionOptions } from "./error-diffusion-options";
import { quantizeErrorDiffusionPixel } from "./quantize-error-diffusion-pixel";
import { runKernelDither } from "./run-kernel-dither";

/** Apply error diffusion dithering */
export function errorDiffusion(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: ErrorDiffusionOptions = {},
): DitherResult {
  const { colorMode, kernel, serpentine, step, strengthFactor } =
    resolveDiffusionDitherOptions(options);

  return runKernelDither({
    height,
    imageData,
    kernel,
    quantize: (pixel) => quantizeErrorDiffusionPixel(pixel, colorMode, step, strengthFactor),
    serpentine,
    width,
  });
}
