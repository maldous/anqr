import { drawModule } from './drawing-primitives';
import type { QRGeneratorConfig } from '../../../modules/qr-generator/types';

/**
 * Draw a timing pattern module
 */
export function drawTimingModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: string,
  config: QRGeneratorConfig
): void {
  if (style === 'match_module') {
    drawModule(ctx, x, y, size, config.moduleStyle || 'square', {
      cornerRadius: config.cornerRadius || 0,
    });
  } else if (style === 'dashed') {
    // Draw dashed timing module
    const dashSize = size * 0.7;
    const offset = (size - dashSize) / 2;
    ctx.fillRect(x + offset, y + offset, dashSize, dashSize);
  } else {
    // Default: solid square
    ctx.fillRect(x, y, size, size);
  }
}
