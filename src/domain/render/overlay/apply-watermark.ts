import type { WatermarkOptions, WatermarkResult } from './watermark.types';
import { applyWatermarkBlendMode } from './apply-watermark-blend-mode';
import { renderTextWatermark } from './render-text-watermark';
import { renderPatternWatermark } from './render-pattern-watermark';
import { calculateWatermarkPositions } from './calculate-watermark-positions';

// ============================================
// MAIN WATERMARK FUNCTIONS
// ============================================

export function applyWatermark(
  sourceCanvas: HTMLCanvasElement,
  options: WatermarkOptions
): WatermarkResult {
  const {
    kind,
    text = '',
    image,
    position = 'bottom-right',
    opacity = 0.5,
    blend = 'normal',
    scale = 1,
    padding = 10,
    font = '16px Arial',
    color = 'rgba(0, 0, 0, 0.3)',
    tiled = false,
  } = options;

  const result = document.createElement('canvas');
  result.width = sourceCanvas.width;
  result.height = sourceCanvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Draw source
  ctx.drawImage(sourceCanvas, 0, 0);

  // Set up blending
  ctx.globalAlpha = opacity;
  applyWatermarkBlendMode(ctx, blend);

  let watermark: HTMLCanvasElement | HTMLImageElement | null = null;

  switch (kind) {
    case 'text':
      watermark = renderTextWatermark(text, font, color);
      break;
    case 'pattern':
      watermark = renderPatternWatermark(text, font, color);
      break;
    case 'image':
      watermark = image || null;
      break;
  }

  if (!watermark) {
    return { canvas: result, width: result.width, height: result.height };
  }

  const wmWidth = watermark.width * scale;
  const wmHeight = watermark.height * scale;

  if (tiled || kind === 'pattern') {
    // Tile the watermark
    const pattern = ctx.createPattern(watermark, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, result.width, result.height);
    }
  } else {
    // Position the watermark
    const pos = calculateWatermarkPositions(
      result.width,
      result.height,
      wmWidth,
      wmHeight,
      position,
      padding
    );
    ctx.drawImage(watermark, pos.x, pos.y, wmWidth, wmHeight);
  }

  // Reset compositing
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  return { canvas: result, width: result.width, height: result.height };
}
