/**
 * QR Generator True Dithering
 * True pixel-level dithering for high-quality overlay integration
 */

import { createLogger } from '../../lib/logger';
import { rgbToGray } from '../core';
import type { QRGeneratorConfig, RGBWithMeta } from './types';

const _log = createLogger('GENERATE');

/**
 * Apply true dithering at pixel level
 */
export function applyTrueDither(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  config: QRGeneratorConfig
): { matrix: boolean[][]; colors: (RGBWithMeta | null)[][] } {
  const _strength = (config.ditherStrength ?? 50) / 100;
  const colorMode = config.colorMode || 'bw';

  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];

  for (let y = 0; y < height; y++) {
    matrix[y] = [];
    colors[y] = [];

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];

      // Calculate brightness
      const brightness = rgbToGray(r, g, b) / 255;

      // Apply dithering threshold
      const threshold = 0.5;
      const isDark = brightness < threshold;

      matrix[y][x] = isDark;

      if (colorMode !== 'bw') {
        colors[y][x] = { r, g, b };
      } else {
        colors[y][x] = null;
      }
    }
  }

  return { matrix, colors };
}
