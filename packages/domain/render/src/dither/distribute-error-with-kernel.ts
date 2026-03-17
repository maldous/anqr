import type { DistributeErrorOptions } from "./distribute-error-options";

/** Distribute error to neighboring pixels */
export function distributeErrorWithKernel(opts: DistributeErrorOptions): void {
  const { pixels, x, y, width, height, errorR, errorG, errorB, kernel, leftToRight } = opts;
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
