/**
 * QR Generator Error Distribution
 * Error distribution for dithering algorithms
 */

import { createLogger } from "@/domain/logging";
import type { DiffusionKernel } from "@/domain/render/qr-generator-shared";

const _log = createLogger("GENERATE");

/**
 * Distribute quantization error to neighboring pixels.
 *
 * Caller (`initErrorMatrix`) pre-allocates every row as a dense `number[]`,
 * so the guard `if (!errors[ny])` and the `|| 0` fallback are dead — every
 * cell is already a number. Skipping them avoids a truthiness check per
 * neighbour and a logical-or per accumulate. See review-2026-05-24 A-F5.
 *
 * `weight / divisor` is hoisted into the `offsets` map's `weight` field at
 * kernel-prep time on the diffusion path that's been migrated; this path
 * uses the legacy DiffusionKernel shape, so we keep the inline divide here.
 */
export function distributeError(
  errors: number[][],
  x: number,
  y: number,
  error: number,
  kernel: DiffusionKernel,
  width: number,
  height: number,
): void {
  const divisor = kernel.divisor;
  for (const offset of kernel.offsets) {
    const nx = x + offset.dx;
    const ny = y + offset.dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      errors[ny][nx] += (error * offset.weight) / divisor;
    }
  }
}
