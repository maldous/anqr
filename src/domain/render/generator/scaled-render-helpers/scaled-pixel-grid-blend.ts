import type { BlendPreservationCtx } from "../scaled-render-types";
import { blendModulePixels } from "./blend-module-pixels";
export { createBlendPreservationContext } from "./create-blend-preservation-context";

export function blendPreservationPass(
  bctx: BlendPreservationCtx,
  boostedModules: Array<{ row: number; col: number }>,
): void {
  const imageData = bctx.ctx.getImageData(0, 0, bctx.size, bctx.size);
  const data = imageData.data;
  for (const { row, col } of boostedModules) {
    const x = bctx.marginPx + col * bctx.effectiveModuleSize;
    const y = bctx.marginPx + row * bctx.effectiveModuleSize;
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(bctx.size, Math.ceil(x + bctx.effectiveModuleSize));
    const y1 = Math.min(bctx.size, Math.ceil(y + bctx.effectiveModuleSize));
    blendModulePixels(bctx, data, row, col, x0, y0, x1, y1);
  }
  bctx.ctx.putImageData(imageData, 0, 0);
}
