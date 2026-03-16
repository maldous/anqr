import type { DitherResult } from "../../../modules/dither-algorithms/types";
import { resolveDiffusionDitherOptions } from "./diffusion-dither-options";
import type { PerceptualDitherOptions } from "./perceptual-dither-options";
import { quantizePerceptualPixel } from "./quantize-perceptual-pixel";
import { runKernelDither } from "./run-kernel-dither";

/** Perceptual dithering - uses perceptual luminance weighting */
export function perceptualDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: PerceptualDitherOptions = {},
): DitherResult {
  const { colorMode, kernel, serpentine, step, strengthFactor } =
    resolveDiffusionDitherOptions(options);

  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const toSRGB = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);

  return runKernelDither({
    height,
    imageData,
    kernel,
    quantize: (pixel) => quantizePerceptualPixel(pixel, colorMode, step, strengthFactor, toSRGB),
    serpentine,
    transform: (r, g, b) => ({ r: toLinear(r), g: toLinear(g), b: toLinear(b) }),
    width,
  });
}
