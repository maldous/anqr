import type { ColorMode, DitherResult } from "../../../modules/dither-algorithms/types";
import { createRNG } from "../../../modules/dither-algorithms/utils";
import { buildBinaryDitherResult } from "./build-binary-dither-result";

export function noiseThresholdDither(
  params: Readonly<{
    height: number;
    imageData: Float32Array[];
    seed?: number;
    strength?: number;
    threshold: (rng: () => number) => number;
    width: number;
    _colorMode?: ColorMode;
  }>,
): DitherResult {
  const rng = createRNG(params.seed ?? 0);

  return buildBinaryDitherResult({
    height: params.height,
    imageData: params.imageData,
    resolveThreshold: () => params.threshold(rng),
    strengthFactor: (params.strength ?? 100) / 100,
    width: params.width,
  });
}
