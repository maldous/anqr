/**
 * QR Generator Standard Pixel Matrix
 * Standard overlay mode pixel matrix generation
 */

import type { QRGeneratorConfig, PixelDecisionMatrix, RGBWithMeta, CreateCanvasFn } from './types';
import type { QRCodeObject } from './cache';
import { getOverlayData } from './overlay-data';
import { normalizeColors } from './pixel-matrix-dither';

/**
 * Generate standard mode pixel matrix
 */
export async function generateStandardMatrix(
  qr: QRCodeObject,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement,
  moduleCount: number,
  effectiveIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  // Get overlay data
  const overlayData = await getOverlayData(overlayCanvas, moduleCount, effectiveConfig, createCanvasFn);

  // Generate matrix from QR data
  const matrix: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    matrix[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      matrix[row][col] = qr.isDark(row, col);
    }
  }

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
