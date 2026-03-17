import type { DitherResult } from "@/modules/dither-algorithms/types";
import { distributeErrorWithKernel } from "./distribute-error-with-kernel";
import { getScanParams } from "./get-scan-params";
import { initDitherResults } from "./init-dither-results";
import type { DiffusionPixelResult } from "./diffusion-pixel-result";
import type { DiffusionKernelDef } from "./kernels.types";

export function runDiffusionDither(params: {
  height: number;
  kernel: DiffusionKernelDef;
  leftPixelAt: (x: number, y: number) => { r: number; g: number; b: number };
  pixels: { r: number; g: number; b: number }[][];
  quantize: (
    pixel: { r: number; g: number; b: number },
    x: number,
    y: number,
  ) => DiffusionPixelResult;
  serpentine: boolean;
  width: number;
}): DitherResult {
  const { resultMatrix, resultColors } = initDitherResults(params.width, params.height);

  for (let y = 0; y < params.height; y++) {
    const { startX, endX, deltaX, leftToRight } = getScanParams(y, params.width, params.serpentine);

    for (let x = startX; deltaX > 0 ? x < endX : x > endX; x += deltaX) {
      const q = params.quantize(params.leftPixelAt(x, y), x, y);
      resultMatrix[y][x] = q.isDark;
      resultColors[y][x] = q.color;
      distributeErrorWithKernel({
        pixels: params.pixels,
        x,
        y,
        width: params.width,
        height: params.height,
        errorR: q.errorR,
        errorG: q.errorG,
        errorB: q.errorB,
        kernel: params.kernel,
        leftToRight,
      });
    }
  }

  return { matrix: resultMatrix, colors: resultColors };
}
