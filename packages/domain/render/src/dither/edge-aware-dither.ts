import type { DitherResult } from "../dither-algorithms/types";
import { computeSobelEdgeMap } from "./compute-sobel-edge-map";
import { resolveDiffusionDitherOptions } from "./diffusion-dither-options";
import type { EdgeAwareDitherOptions } from "./edge-aware-dither-options";
import { quantizeEdgeAwarePixel } from "./quantize-edge-aware-pixel";
import { runKernelDither } from "./run-kernel-dither";

/** Edge-aware dithering - reduces error diffusion across edges */
export function edgeAwareDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  options: EdgeAwareDitherOptions = {},
): DitherResult {
  const { colorMode, kernel, serpentine, step, strengthFactor } =
    resolveDiffusionDitherOptions(options);

  const edgeMap = computeSobelEdgeMap(imageData, width, height);
  return runKernelDither({
    height,
    imageData,
    kernel,
    quantize: (pixel, x, y) =>
      quantizeEdgeAwarePixel(pixel, colorMode, step, strengthFactor, 1 - edgeMap[y][x] * 0.8),
    serpentine,
    width,
  });
}
