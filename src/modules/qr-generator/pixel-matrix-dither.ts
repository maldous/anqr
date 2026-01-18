/**
 * QR Generator Dither Mode Pixel Matrix
 * Dither and extreme mode pixel matrix generation
 */

import type { QRCodeObject } from './cache';
import { applyDitherToMatrix } from './dithering-matrix';
import { getOverlayData } from './overlay-data';
import type { CreateCanvasFn, PixelDecisionMatrix, QRGeneratorConfig, RGBWithMeta } from './types';

/**
 * Normalize colors to RGB format
 * Colors are now stored as {r, g, b} objects directly in OverlayData
 */
export function normalizeColors(
  colors: Record<number, Record<number, { r: number; g: number; b: number }>> | undefined,
  moduleCount: number
): (RGBWithMeta | null)[][] {
  const result: (RGBWithMeta | null)[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    result[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      const color = colors?.[row]?.[col];
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
  const colors = normalizeColors(overlayData.colors, moduleCount);

  return {
    matrix,
    colors,
    scale: 1,
    overlayData,
    effectiveIntensity,
  };
}
