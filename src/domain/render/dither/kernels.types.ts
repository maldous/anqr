import type { DiffusionKernel } from '../../../modules/dither-algorithms/types';

export interface DiffusionKernelDef {
  matrix: number[][];
  divisor: number;
  offset: number;
  prepared?: {
    xOffsetsLtr: Int8Array;
    xOffsetsRtl: Int8Array;
    yOffsets: Uint8Array;
    normalizedWeights: Float32Array;
  };
}
