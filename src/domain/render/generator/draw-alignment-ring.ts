import { roundRect } from './drawing-primitives';

/**
 * Draw an alignment ring with the specified style
 */
export function drawAlignmentRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string
): void {
  switch (style) {
    case 'rounded': {
      const radius = size * 0.15;
      roundRect(ctx, x, y, size, size, radius);
      break;
    }
    case 'circle': {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default:
      ctx.fillRect(x, y, size, size);
      break;
  }
}
