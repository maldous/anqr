import { pixelIndex } from "./pixel-index";
import type { ConstraintCtx } from "./constraint-ctx";

export function computeModuleOccupancy(
  ctx: ConstraintCtx,
  mr: number,
  mc: number,
): { darkCount: number; centerDarkCount: number; desireSum: number; desireSq: number } {
  const y0 = mr * ctx.scale;
  const x0 = mc * ctx.scale;
  let darkCount = 0;
  let centerDarkCount = 0;
  let desireSum = 0;
  let desireSq = 0;
  for (let y = 0; y < ctx.scale; y++) {
    for (let x = 0; x < ctx.scale; x++) {
      const yy = y0 + y;
      const xx = x0 + x;
      const dark = ctx.matrixBits[pixelIndex(xx, yy, ctx.scaledSize)] === 1;
      if (dark) darkCount++;
      if (
        dark &&
        Math.abs(y - ctx.moduleCenter) <= ctx.centerRadius &&
        Math.abs(x - ctx.moduleCenter) <= ctx.centerRadius
      ) {
        centerDarkCount++;
      }
      const d = ctx.desire[pixelIndex(x0 + x, y0 + y, ctx.scaledSize)];
      desireSum += d;
      desireSq += d * d;
    }
  }
  return { darkCount, centerDarkCount, desireSum, desireSq };
}
