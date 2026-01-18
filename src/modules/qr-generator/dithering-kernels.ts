/**
 * QR Generator Dithering Kernels
 * Error diffusion kernels for dithering algorithms
 */

import type { DiffusionKernel } from './types';

/**
 * Get diffusion kernel by name
 */
export function getDiffusionKernel(name: string): DiffusionKernel {
  const kernels: Record<string, DiffusionKernel> = {
    floyd_steinberg: {
      offsets: [
        { dx: 1, dy: 0, weight: 7 },
        { dx: -1, dy: 1, weight: 3 },
        { dx: 0, dy: 1, weight: 5 },
        { dx: 1, dy: 1, weight: 1 },
      ],
      divisor: 16,
    },
    jarvis_judice_ninke: {
      offsets: [
        { dx: 1, dy: 0, weight: 7 },
        { dx: 2, dy: 0, weight: 5 },
        { dx: -2, dy: 1, weight: 3 },
        { dx: -1, dy: 1, weight: 5 },
        { dx: 0, dy: 1, weight: 7 },
        { dx: 1, dy: 1, weight: 5 },
        { dx: 2, dy: 1, weight: 3 },
        { dx: -2, dy: 2, weight: 1 },
        { dx: -1, dy: 2, weight: 3 },
        { dx: 0, dy: 2, weight: 5 },
        { dx: 1, dy: 2, weight: 3 },
        { dx: 2, dy: 2, weight: 1 },
      ],
      divisor: 48,
    },
    stucki: {
      offsets: [
        { dx: 1, dy: 0, weight: 8 },
        { dx: 2, dy: 0, weight: 4 },
        { dx: -2, dy: 1, weight: 2 },
        { dx: -1, dy: 1, weight: 4 },
        { dx: 0, dy: 1, weight: 8 },
        { dx: 1, dy: 1, weight: 4 },
        { dx: 2, dy: 1, weight: 2 },
        { dx: -2, dy: 2, weight: 1 },
        { dx: -1, dy: 2, weight: 2 },
        { dx: 0, dy: 2, weight: 4 },
        { dx: 1, dy: 2, weight: 2 },
        { dx: 2, dy: 2, weight: 1 },
      ],
      divisor: 42,
    },
    atkinson: {
      offsets: [
        { dx: 1, dy: 0, weight: 1 },
        { dx: 2, dy: 0, weight: 1 },
        { dx: -1, dy: 1, weight: 1 },
        { dx: 0, dy: 1, weight: 1 },
        { dx: 1, dy: 1, weight: 1 },
        { dx: 0, dy: 2, weight: 1 },
      ],
      divisor: 8,
    },
    burkes: {
      offsets: [
        { dx: 1, dy: 0, weight: 8 },
        { dx: 2, dy: 0, weight: 4 },
        { dx: -2, dy: 1, weight: 2 },
        { dx: -1, dy: 1, weight: 4 },
        { dx: 0, dy: 1, weight: 8 },
        { dx: 1, dy: 1, weight: 4 },
        { dx: 2, dy: 1, weight: 2 },
      ],
      divisor: 32,
    },
    sierra: {
      offsets: [
        { dx: 1, dy: 0, weight: 5 },
        { dx: 2, dy: 0, weight: 3 },
        { dx: -2, dy: 1, weight: 2 },
        { dx: -1, dy: 1, weight: 4 },
        { dx: 0, dy: 1, weight: 5 },
        { dx: 1, dy: 1, weight: 4 },
        { dx: 2, dy: 1, weight: 2 },
        { dx: -1, dy: 2, weight: 2 },
        { dx: 0, dy: 2, weight: 3 },
        { dx: 1, dy: 2, weight: 2 },
      ],
      divisor: 32,
    },
    sierra_two_row: {
      offsets: [
        { dx: 1, dy: 0, weight: 4 },
        { dx: 2, dy: 0, weight: 3 },
        { dx: -2, dy: 1, weight: 1 },
        { dx: -1, dy: 1, weight: 2 },
        { dx: 0, dy: 1, weight: 3 },
        { dx: 1, dy: 1, weight: 2 },
        { dx: 2, dy: 1, weight: 1 },
      ],
      divisor: 16,
    },
    sierra_lite: {
      offsets: [
        { dx: 1, dy: 0, weight: 2 },
        { dx: -1, dy: 1, weight: 1 },
        { dx: 0, dy: 1, weight: 1 },
      ],
      divisor: 4,
    },
  };

  return kernels[name] || kernels.floyd_steinberg;
}
