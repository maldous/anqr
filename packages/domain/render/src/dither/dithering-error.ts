/**
 * QR Generator Error Distribution
 * Error distribution for dithering algorithms
 */

import { createLogger } from "../../../../observability/logging/src";
import type { DiffusionKernel } from "@/modules/qr-generator/types";

const _log = createLogger("GENERATE");

/**
 * Distribute quantization error to neighboring pixels
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
  for (const offset of kernel.offsets) {
    const nx = x + offset.dx;
    const ny = y + offset.dy;

    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      if (!errors[ny]) errors[ny] = [];
      errors[ny][nx] = (errors[ny][nx] || 0) + (error * offset.weight) / kernel.divisor;
    }
  }
}
