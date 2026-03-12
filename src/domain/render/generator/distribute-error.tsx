import type { DiffusionKernelDef } from '../dither/kernels';
import { pixelIndex } from './pixel-index';

/**
 * Distribute error to neighboring pixels using the specified kernel.
 * Supports serpentine scanning by mirroring x-offsets when scanning right-to-left.
 */
export function distributeError(
  errors: Float32Array,
  x: number,
  y: number,
  error: number,
  kernel: DiffusionKernelDef,
  scaledSize: number,
  leftToRight: boolean
): void {
  const prepared = kernel.prepared;
  if (!prepared) return;

  const xOffsets = leftToRight ? prepared.xOffsetsLtr : prepared.xOffsetsRtl;
  const yOffsets = prepared.yOffsets;
  const normalizedWeights = prepared.normalizedWeights;
  for (let i = 0; i < xOffsets.length; i++) {
    const nx = x + xOffsets[i];
    const ny = y + yOffsets[i];
    if (nx >= 0 && nx < scaledSize && ny < scaledSize) {
      errors[pixelIndex(nx, ny, scaledSize)] += error * normalizedWeights[i];
    }
  }
}
