import { roundRect } from './drawing-primitives';

/**
 * Draw a finder ring with the specified style
 */
function drawFinderRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string
): void {
  switch (style) {
    case 'rounded': {
      const radius = size * 0.2;
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

/**
 * Draw an alignment ring with the specified style
 */
function drawAlignmentRing(
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

export { drawFinderRing, drawAlignmentRing };
