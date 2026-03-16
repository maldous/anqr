import type { ColorMode, DitherResult } from "../../../modules/dither-algorithms/types";
import { clamp01 } from "../../../modules/dither-algorithms/utils";
import { runNoiseThresholdDither } from "./run-noise-threshold-dither";

/** Apply Gaussian noise dithering */
export function gaussianNoiseDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  seed: number = 0,
  strength: number = 100,
  _colorMode: ColorMode = "bw",
): DitherResult {
  return runNoiseThresholdDither(imageData, width, height, seed, strength, _colorMode, (rng) => {
    const u1 = rng() || 0.0001;
    const u2 = rng();
    return clamp01(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 0.2 + 0.5);
  });
}
