import type { WatermarkPosition } from './watermark.types';

// ============================================
// POSITION CALCULATION
// ============================================

export function calculateWatermarkPositions(
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: WatermarkPosition,
  padding: number = 10
): { x: number; y: number } {
  let x = padding;
  let y = padding;

  switch (position) {
    case 'top-left':
      break;
    case 'top-center':
      x = (canvasWidth - watermarkWidth) / 2;
      break;
    case 'top-right':
      x = canvasWidth - watermarkWidth - padding;
      break;
    case 'center-left':
      y = (canvasHeight - watermarkHeight) / 2;
      break;
    case 'center':
      x = (canvasWidth - watermarkWidth) / 2;
      y = (canvasHeight - watermarkHeight) / 2;
      break;
    case 'center-right':
      x = canvasWidth - watermarkWidth - padding;
      y = (canvasHeight - watermarkHeight) / 2;
      break;
    case 'bottom-left':
      y = canvasHeight - watermarkHeight - padding;
      break;
    case 'bottom-center':
      x = (canvasWidth - watermarkWidth) / 2;
      y = canvasHeight - watermarkHeight - padding;
      break;
    case 'bottom-right':
      x = canvasWidth - watermarkWidth - padding;
      y = canvasHeight - watermarkHeight - padding;
      break;
  }

  return { x, y };
}
