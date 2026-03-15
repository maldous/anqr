import type { ColorMode, DitherResult } from '../../../modules/dither-algorithms/types';
import { runNoiseThresholdDither } from './run-noise-threshold-dither';

export function createNoiseThresholdDither(threshold: (rng: () => number) => number) {
  return (
    imageData: Float32Array[],
    width: number,
    height: number,
    seed: number = 0,
    strength: number = 100,
    colorMode: ColorMode = 'bw'
  ): DitherResult =>
    runNoiseThresholdDither(imageData, width, height, seed, strength, colorMode, threshold);
}
