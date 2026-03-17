import { drawHalftoneModule, drawModule, drawTimingModule } from "./drawing";
import { drawHalftoneDitheredBackground } from "./draw-halftone-background";
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

export function drawModuleHalftone(
  dctx: ModuleDrawContext,
  drawX: number,
  drawY: number,
  adjustedSize: number,
  isDark: boolean,
  halftoneBrightness: number,
  moduleFillStyle: string | CanvasGradient,
  row: number,
  col: number,
): void {
  if (dctx.overlayModeIsHalftoneDithered) {
    drawHalftoneDitheredBackground(
      dctx,
      drawX,
      drawY,
      adjustedSize,
      isDark,
      moduleFillStyle,
      row,
      col,
    );
  }
  drawHalftoneModule(
    dctx.ctx as CanvasRenderingContext2D,
    drawX,
    drawY,
    adjustedSize,
    halftoneBrightness,
    dctx.config,
    row,
    col,
  );
}

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
