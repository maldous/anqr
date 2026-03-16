import { drawStyledRing } from "./draw-styled-ring";

/**
 * Draw a finder ring with the specified style
 */
export function drawFinderRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string,
): void {
  drawStyledRing(ctx, x, y, size, style, 0.2);
}
