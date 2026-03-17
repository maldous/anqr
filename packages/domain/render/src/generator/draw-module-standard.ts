import { drawModule } from "./drawing";
import type { ModuleDrawContext } from "./module-draw-context.types";

export function drawModuleStandard(
  dctx: ModuleDrawContext,
  drawX: number,
  drawY: number,
  adjustedSize: number,
): void {
  drawModule(
    dctx.ctx as CanvasRenderingContext2D,
    drawX,
    drawY,
    adjustedSize,
    dctx.config.moduleStyle,
    {
      cornerRadius: dctx.cornerRadius,
      rotation: dctx.dotRotation,
    },
  );
}
