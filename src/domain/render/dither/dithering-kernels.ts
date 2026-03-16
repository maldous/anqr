/**
 * QR Generator Dithering Kernels
 * Error diffusion kernels for dithering algorithms
 */

import { createLogger } from "../../../infra/logging/logger";
import type { DiffusionKernel } from "../../../modules/qr-generator/types";

const _log = createLogger("GENERATE");

const BURKES_OFFSETS = [
  { dx: 1, dy: 0, weight: 8 },
  { dx: 2, dy: 0, weight: 4 },
  { dx: -2, dy: 1, weight: 2 },
  { dx: -1, dy: 1, weight: 4 },
  { dx: 0, dy: 1, weight: 8 },
  { dx: 1, dy: 1, weight: 4 },
  { dx: 2, dy: 1, weight: 2 },
] as const;

const STUCKI_OFFSETS = [
  ...BURKES_OFFSETS,
  { dx: -2, dy: 2, weight: 1 },
  { dx: -1, dy: 2, weight: 2 },
  { dx: 0, dy: 2, weight: 4 },
  { dx: 1, dy: 2, weight: 2 },
  { dx: 2, dy: 2, weight: 1 },
] as const;

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
      offsets: [...STUCKI_OFFSETS],
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
      offsets: [...BURKES_OFFSETS],
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
