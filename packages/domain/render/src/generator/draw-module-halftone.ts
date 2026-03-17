import { drawHalftoneModule } from "./drawing";
import { drawHalftoneDitheredBackground } from "./draw-halftone-background";
import type { ModuleDrawContext } from "./module-draw-context.types";

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
