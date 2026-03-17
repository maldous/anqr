import { drawStyledRing } from "./draw-styled-ring";

/**
 * Draw an alignment ring with the specified style
 */
export function drawAlignmentRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string,
): void {
  drawStyledRing(ctx, x, y, size, style, 0.15);
}
