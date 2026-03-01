/**
 * Error Diffusion Kernels
 */

import { createLogger } from '../../lib/logger';
import type { DiffusionKernel } from './types';

const _log = createLogger('DITHER');

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

export const DIFFUSION_KERNELS: Record<DiffusionKernel, DiffusionKernelDef> = {
  floyd_steinberg: {
    matrix: [
      [0, 0, 7],
      [3, 5, 1],
    ],
    divisor: 16,
    offset: 1,
  },
  jarvis_judice_ninke: {
    matrix: [
      [0, 0, 0, 7, 5],
      [3, 5, 7, 5, 3],
      [1, 3, 5, 3, 1],
    ],
    divisor: 48,
    offset: 2,
  },
  stucki: {
    matrix: [
      [0, 0, 0, 8, 4],
      [2, 4, 8, 4, 2],
      [1, 2, 4, 2, 1],
    ],
    divisor: 42,
    offset: 2,
  },
  burkes: {
    matrix: [
      [0, 0, 0, 8, 4],
      [2, 4, 8, 4, 2],
    ],
    divisor: 32,
    offset: 2,
  },
  sierra: {
    matrix: [
      [0, 0, 0, 5, 3],
      [2, 4, 5, 4, 2],
      [0, 2, 3, 2, 0],
    ],
    divisor: 32,
    offset: 2,
  },
  sierra_2: {
    matrix: [
      [0, 0, 0, 4, 3],
      [1, 2, 3, 2, 1],
    ],
    divisor: 16,
    offset: 2,
  },
  sierra_lite: {
    matrix: [
      [0, 0, 2],
      [1, 1, 0],
    ],
    divisor: 4,
    offset: 1,
  },
  two_row_sierra: {
    matrix: [
      [0, 0, 0, 4, 3],
      [1, 2, 3, 2, 1],
    ],
    divisor: 16,
    offset: 2,
  },
  atkinson: {
    matrix: [
      [0, 0, 1, 1],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
    ],
    divisor: 8,
    offset: 1,
  },
};

function prepareKernel(kernel: DiffusionKernelDef): void {
  let count = 0;
  for (let ky = 0; ky < kernel.matrix.length; ky++) {
    for (let kx = 0; kx < kernel.matrix[ky].length; kx++) {
      if (kernel.matrix[ky][kx] !== 0) count += 1;
    }
  }

  const xOffsetsLtr = new Int8Array(count);
  const xOffsetsRtl = new Int8Array(count);
  const yOffsets = new Uint8Array(count);
  const normalizedWeights = new Float32Array(count);

  let idx = 0;
  for (let ky = 0; ky < kernel.matrix.length; ky++) {
    for (let kx = 0; kx < kernel.matrix[ky].length; kx++) {
      const weight = kernel.matrix[ky][kx];
      if (weight === 0) continue;
      const offsetX = kx - kernel.offset;
      xOffsetsLtr[idx] = offsetX;
      xOffsetsRtl[idx] = -offsetX;
      yOffsets[idx] = ky;
      normalizedWeights[idx] = weight / kernel.divisor;
      idx += 1;
    }
  }

  kernel.prepared = {
    xOffsetsLtr,
    xOffsetsRtl,
    yOffsets,
    normalizedWeights,
  };
}

for (const kernel of Object.values(DIFFUSION_KERNELS)) {
  prepareKernel(kernel);
}
