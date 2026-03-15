import type { ColorMode, DitherResult } from '../../../modules/dither-algorithms/types';
import { noiseThresholdDither } from './noise-threshold-dither';

export function runNoiseThresholdDither(
  imageData: Float32Array[],
  width: number,
  height: number,
  seed: number,
  strength: number,
  colorMode: ColorMode,
  threshold: (rng: () => number) => number
): DitherResult {
  return noiseThresholdDither({
    height,
    imageData,
    seed,
    strength,
    threshold,
    width,
    _colorMode: colorMode,
  });
}
