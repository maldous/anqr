import type { DrawModuleOptions } from './drawing-primitives.types';
import { roundRect } from './round-rect';

/**
 * Draw a single QR module with the specified style
 */
export function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string = 'square',
  options: DrawModuleOptions = {}
): void {
  const { cornerRadius = 0, rotation = 0 } = options;

  // Only save/restore when rotation is non-zero (expensive on Android WebView)
  if (rotation !== 0) {
    ctx.save();
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);
  }

  switch (style) {
    case 'rounded': {
      const radius = (cornerRadius / 100) * (size / 2);
      roundRect(ctx, x, y, size, size, radius);
      break;
    }

    case 'dots': {
      const radius = size * 0.4;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'diamond': {
      const half = size / 2;
      ctx.beginPath();
      ctx.moveTo(x + half, y);
      ctx.lineTo(x + size, y + half);
      ctx.lineTo(x + half, y + size);
      ctx.lineTo(x, y + half);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'star': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const outerRadius = size * 0.45;
      const innerRadius = size * 0.2;
      const points = 5;

      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'heart': {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const s = size * 0.3;

      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.8);
      ctx.bezierCurveTo(cx - s * 1.5, cy - s * 0.5, cx - s * 0.5, cy - s * 1.5, cx, cy - s * 0.5);
      ctx.bezierCurveTo(cx + s * 0.5, cy - s * 1.5, cx + s * 1.5, cy - s * 0.5, cx, cy + s * 0.8);
      ctx.fill();
      break;
    }
    default:
      ctx.fillRect(x, y, size, size);
      break;
  }

  if (rotation !== 0) {
    ctx.restore();
  }
}
