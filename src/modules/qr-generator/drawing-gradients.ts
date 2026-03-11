/**
 * QR Generator Gradient Drawing
 * Gradient creation and application for QR modules
 */

import { createLogger } from '../../lib/logger';
import type { QRGeneratorConfig } from './types';

const _log = createLogger('GENERATE');

/**
 * Create a gradient fill based on config
 */
export function createGradientFill(
  ctx: CanvasRenderingContext2D,
  config: QRGeneratorConfig,
  size: number
): CanvasGradient | null {
  if (!config.gradient || config.gradient.type === 'none') {
    return null;
  }

  const { type, angle = 0, stops: configStops = [] } = config.gradient;

  // Auto-generate default stops from fg/bg colors when stops are empty
  const stops =
    configStops.length > 0
      ? configStops
      : [
          { pos: 0, color: config.fgColor || '#000000' },
          { pos: 1, color: config.bgColor || '#ffffff' },
        ];

  let gradient: CanvasGradient;

  switch (type) {
    case 'linear': {
      const rad = (angle * Math.PI) / 180;
      const x1 = size / 2 - (Math.cos(rad) * size) / 2;
      const y1 = size / 2 - (Math.sin(rad) * size) / 2;
      const x2 = size / 2 + (Math.cos(rad) * size) / 2;
      const y2 = size / 2 + (Math.sin(rad) * size) / 2;
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      break;
    }

    case 'radial':
    case 'conic': {
      // Canvas doesn't support conic gradients natively, fall back to radial
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2;
      gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      break;
    }

    default:
      return null;
  }

  // Add color stops
  for (const stop of stops) {
    gradient.addColorStop(stop.pos, stop.color);
  }

  return gradient;
}
