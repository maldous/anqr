/**
 * QR Generator Pixel Matrix Overlay
 * Unified overlay data preparation
 */

import type { QRCodeObject } from './cache';
import { applyDitherToMatrix } from './dithering-matrix';
import { getOverlayData } from './overlay-data';
import { getEffectiveIntensity } from './pixel-matrix-utils';
import type { CreateCanvasFn, OverlayData, QRGeneratorConfig } from './types';

/**
 * Prepare unified overlay data for rendering
 */
export async function prepareUnifiedOverlayData(
  qr: QRCodeObject,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  moduleCount: number,
  createCanvasFn: CreateCanvasFn
): Promise<{
  ditherPattern: boolean[][] | null;
  overlayData: OverlayData | null;
  effectiveIntensity: number;
}> {
  if (!overlayCanvas) {
    return {
      ditherPattern: null,
      overlayData: null,
      effectiveIntensity: 0,
    };
  }

  const { effectiveIntensity, effectiveConfig } = getEffectiveIntensity(config);

  // Get overlay data
  const overlayData = await getOverlayData(
    overlayCanvas,
    moduleCount,
    effectiveConfig,
    createCanvasFn
  );

  // Apply dithering if needed
  let ditherPattern: boolean[][] | null = null;
  const overlayMode = config.overlayMode || 'blend';

  if (overlayMode === 'dither' || overlayMode === 'extreme') {
    ditherPattern = applyDitherToMatrix(qr, moduleCount, overlayData, effectiveConfig);
  }

  return {
    ditherPattern,
    overlayData,
    effectiveIntensity,
  };
}
