import type { DistributeErrorOptions } from "./distribute-error-options";

/**
 * Distribute quantization error to neighbouring pixels.
 *
 * Fast path uses the typed-array `kernel.prepared` layout produced by
 * `prepareKernel`: x/y offsets and pre-divided weights packed into typed
 * arrays. This eliminates the per-pixel weight/divisor division and the
 * nested matrix-walk seen in the legacy path. Numerically identical
 * (same float math, just pre-computed). See review-2026-05-24 A-F1.
 */
export function distributeErrorWithKernel(opts: DistributeErrorOptions): void {
  const { pixels, x, y, width, height, errorR, errorG, errorB, kernel, leftToRight } = opts;
  const prepared = kernel.prepared;
  if (prepared) {
    const xs = leftToRight ? prepared.xOffsetsLtr : prepared.xOffsetsRtl;
    const ys = prepared.yOffsets;
    const ws = prepared.normalizedWeights;
    const len = ws.length;
    for (let k = 0; k < len; k++) {
      const nx = x + xs[k];
      const ny = y + ys[k];
      if (nx >= 0 && nx < width && ny < height) {
        const w = ws[k];
        const target = pixels[ny][nx];
        target.r += errorR * w;
        target.g += errorG * w;
        target.b += errorB * w;
      }
    }
    return;
  }

  // Legacy slow path — kept for kernels that haven't been pre-prepared yet.
  for (let ky = 0; ky < kernel.matrix.length; ky++) {
    for (let kx = 0; kx < kernel.matrix[ky].length; kx++) {
      const weight = kernel.matrix[ky][kx];
      if (weight === 0) continue;

      let offsetX = kx - kernel.offset;
      if (!leftToRight) offsetX = -offsetX;

      const nx = x + offsetX;
      const ny = y + ky;

      if (nx >= 0 && nx < width && ny < height) {
        const factor = weight / kernel.divisor;
        pixels[ny][nx].r += errorR * factor;
        pixels[ny][nx].g += errorG * factor;
        pixels[ny][nx].b += errorB * factor;
      }
    }
  }
}
