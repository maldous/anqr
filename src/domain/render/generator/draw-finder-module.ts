import { drawModule } from './draw-module';

/**
 * Draw a finder pattern module (larger, no rotation)
 */
export function drawFinderModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string = 'square',
  cornerRadius: number = 0
): void {
  drawModule(ctx, x, y, size, style, { cornerRadius, rotation: 0 });
}
