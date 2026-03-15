import { drawHalftoneModule, drawModule, drawTimingModule } from './drawing';
import { drawHalftoneDitheredBackground } from './draw-halftone-background';
import type { ModuleDrawContext } from './module-draw-context.interface';

export function drawStyledModule(
  dctx: ModuleDrawContext,
  drawX: number,
  drawY: number,
  adjustedSize: number,
  isDark: boolean,
  isTiming: boolean,
  drawOutlineOnly: boolean,
  useHalftoneRendering: boolean,
  halftoneBrightness: number,
  finalModuleColor: string,
  moduleFillStyle: string | CanvasGradient,
  row: number,
  col: number
): void {
  if (drawOutlineOnly || (dctx.isStrokeGapMode && isDark)) {
    dctx.ctx.strokeStyle = finalModuleColor;
    dctx.ctx.lineWidth = dctx.strokeWidth || 1;
    dctx.ctx.strokeRect(
      drawX + dctx.ctx.lineWidth / 2,
      drawY + dctx.ctx.lineWidth / 2,
      adjustedSize - dctx.ctx.lineWidth,
      adjustedSize - dctx.ctx.lineWidth
    );
  } else if (useHalftoneRendering && !dctx.isFastPreview) {
    if (dctx.overlayModeIsHalftoneDithered) {
      drawHalftoneDitheredBackground(
        dctx,
        drawX,
        drawY,
        adjustedSize,
        isDark,
        moduleFillStyle,
        row,
        col
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
      col
    );
  } else if (isTiming) {
    drawTimingModule(
      dctx.ctx as CanvasRenderingContext2D,
      drawX,
      drawY,
      adjustedSize,
      dctx.timingStyle,
      dctx.config
    );
  } else {
    drawModule(
      dctx.ctx as CanvasRenderingContext2D,
      drawX,
      drawY,
      adjustedSize,
      dctx.config.moduleStyle,
      {
        cornerRadius: dctx.cornerRadius,
        rotation: dctx.dotRotation,
      }
    );
  }
}
