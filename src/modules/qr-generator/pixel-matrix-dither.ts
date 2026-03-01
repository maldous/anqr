/**
 * QR Generator Dither Mode Pixel Matrix
 * Dither and extreme mode pixel matrix generation
 */

import { createLogger } from '../../lib/logger';
import type { QRCodeObject } from './cache';
import { applyDitherToMatrix } from './dithering-matrix';
import { getOverlayColor } from './overlay-data-packed';
import { getOverlayData } from './overlay-data';
import type {
  CreateCanvasFn,
  OverlayData,
  PixelDecisionMatrix,
  QRGeneratorConfig,
  RGBWithMeta,
} from './types';

const _log = createLogger('GENERATE');

/**
 * Normalize colors to RGB format
 * Supports packed overlay colors (with legacy sparse fallback via helper).
 */
export function normalizeColors(
  overlayData: OverlayData | null | undefined,
  moduleCount: number
): (RGBWithMeta | null)[][] {
  const result: (RGBWithMeta | null)[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    result[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      const color = getOverlayColor(overlayData, row, col);
      if (color) {
        // Color is already {r, g, b} object
        result[row][col] = {
          r: color.r,
          g: color.g,
          b: color.b,
        };
      } else {
        result[row][col] = null;
      }
    }
  }

  return result;
}

/**
 * Generate dither mode pixel matrix
 */
export async function generateDitherModeMatrix(
  qr: QRCodeObject,
  _config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  effectiveIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  _overlayMode: string,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  // Get overlay data
  const overlayData = await getOverlayData(
    overlayCanvas,
    moduleCount,
    effectiveConfig,
    createCanvasFn
  );

  // Apply dithering to create modified QR matrix
  const matrix = applyDitherToMatrix(qr, moduleCount, overlayData, effectiveConfig);

  // Normalize colors
  const colors = normalizeColors(overlayData, moduleCount);

  return {
    matrix,
    colors,
    scale: 1,
    overlayData,
    effectiveIntensity,
  };
}
