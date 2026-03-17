import type { ModuleDrawContext } from "./module-draw-context.types";

export function drawModuleOutline(
  dctx: ModuleDrawContext,
  drawX: number,
  drawY: number,
  adjustedSize: number,
  finalModuleColor: string,
): void {
  dctx.ctx.strokeStyle = finalModuleColor;
  dctx.ctx.lineWidth = dctx.strokeWidth || 1;
  dctx.ctx.strokeRect(
    drawX + dctx.ctx.lineWidth / 2,
    drawY + dctx.ctx.lineWidth / 2,
    adjustedSize - dctx.ctx.lineWidth,
    adjustedSize - dctx.ctx.lineWidth,
  );
}
