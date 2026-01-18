/**
 * Error Diffusion Kernels
 */

import type { DiffusionKernel } from './types';

export interface DiffusionKernelDef {
  matrix: number[][];
  divisor: number;
  offset: number;
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
