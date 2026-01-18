/**
 * QR Generator Dither Mode Pixel Matrix
 * Dither and extreme mode pixel matrix generation
 */

import type { QRGeneratorConfig, PixelDecisionMatrix, RGBWithMeta, CreateCanvasFn } from './types';
import type { QRCodeObject } from './cache';
import { getOverlayData } from './overlay-data';
import { applyDitherToMatrix } from './dithering-matrix';

/**
 * Normalize colors to RGB format
 */
export function normalizeColors(
  colors: Record<number, Record<number, string>> | undefined,
  moduleCount: number
): (RGBWithMeta | null)[][] {
  const result: (RGBWithMeta | null)[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    result[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      const colorStr = colors?.[row]?.[col];
      if (colorStr) {
        // Parse rgb(r,g,b) format
        const match = /rgb\((\d+),(\d+),(\d+)\)/.exec(colorStr);
        if (match) {
          result[row][col] = {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
          };
        } else {
          result[row][col] = null;
        }
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
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement,
  moduleCount: number,
  effectiveIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  overlayMode: string,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  // Get overlay data
  const overlayData = await getOverlayData(overlayCanvas, moduleCount, effectiveConfig, createCanvasFn);

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
