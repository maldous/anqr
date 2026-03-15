import { roundRect } from './drawing-primitives';

export function drawStyledRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string,
  roundedRadiusFactor: number
): void {
  switch (style) {
    case 'rounded': {
      roundRect(ctx, x, y, size, size, size * roundedRadiusFactor);
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
