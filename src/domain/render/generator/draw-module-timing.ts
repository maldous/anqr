import { drawTimingModule } from "./drawing";
import type { ModuleDrawContext } from "./module-draw-context.types";

export function drawModuleTiming(
  dctx: ModuleDrawContext,
  drawX: number,
  drawY: number,
  adjustedSize: number,
): void {
  drawTimingModule(
    dctx.ctx as CanvasRenderingContext2D,
    drawX,
    drawY,
    adjustedSize,
    dctx.timingStyle,
    dctx.config,
  );
}
