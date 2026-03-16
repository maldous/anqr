import { getOverlayColorPacked } from "../overlay/overlay-data-packed";
import type { ModuleDrawContext } from "./module-draw-context.interface";

export function drawHalftoneDitheredBackground(
  dctx: ModuleDrawContext,
  drawX: number,
  drawY: number,
  adjustedSize: number,
  isDark: boolean,
  moduleFillStyle: string | CanvasGradient,
  row: number,
  col: number,
): void {
  const cellColor = getOverlayColorPacked(dctx.overlayData, row, col);
  if (!cellColor) return;
  const cellR = (cellColor >> 16) & 0xff;
  const cellG = (cellColor >> 8) & 0xff;
  const cellB = cellColor & 0xff;
  if (isDark) {
    const darkBackdrop = 0.5;
    const backR = Math.round(cellR * darkBackdrop);
    const backG = Math.round(cellG * darkBackdrop);
    const backB = Math.round(cellB * darkBackdrop);
    dctx.setFillStyle(`rgb(${backR},${backG},${backB})`);
  } else {
    const lightBlend = 0.46;
    const backR = Math.round(cellR + (255 - cellR) * lightBlend);
    const backG = Math.round(cellG + (255 - cellG) * lightBlend);
    const backB = Math.round(cellB + (255 - cellB) * lightBlend);
    dctx.setFillStyle(`rgb(${backR},${backG},${backB})`);
  }
  dctx.ctx.fillRect(drawX, drawY, adjustedSize, adjustedSize);
  dctx.setFillStyle(moduleFillStyle);
}
