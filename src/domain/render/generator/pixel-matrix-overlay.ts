/**
 * QR Generator Pixel Matrix Overlay
 * Unified overlay data preparation
 */

import { createLogger } from '../../../infra/logging/logger';
import type { QRCodeObject } from '../../../modules/qr-generator/cache';
import { applyDitherToMatrix } from '../dither/dithering-matrix';
import { getOverlayData } from '../overlay/overlay-data';
import { generateHalftoneDitheredOverlayData } from './pixel-matrix-dithered';
import { getEffectiveIntensity } from './pixel-matrix-utils';
import type {
  CreateCanvasFn,
  OverlayData,
  QRCodeInstance,
  QRGeneratorConfig,
} from '../../../modules/qr-generator/types';

const _log = createLogger('GENERATE');

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

  // Halftone-dithered: use error-diffusion density instead of raw overlay brightness
  const overlayMode = config.overlayMode || 'blend';
  if (overlayMode === 'halftone-dithered') {
    const result = await generateHalftoneDitheredOverlayData(
      // Safe: QRCodeObject satisfies QRCodeInstance (isDark + getModuleCount)
      qr as QRCodeInstance,
      effectiveConfig,
      overlayCanvas,
      moduleCount,
      effectiveIntensity,
      effectiveConfig,
      createCanvasFn
    );
    return {
      ditherPattern: null,
      overlayData: result.overlayData,
      effectiveIntensity: result.effectiveIntensity,
    };
  }

  // Get overlay data
  const overlayData = await getOverlayData(
    overlayCanvas,
    moduleCount,
    effectiveConfig,
    createCanvasFn
  );

  // Apply dithering if needed
  let ditherPattern: boolean[][] | null = null;
  if (overlayMode === 'dither' || overlayMode === 'extreme') {
    ditherPattern = applyDitherToMatrix(qr, moduleCount, overlayData, effectiveConfig);
  }

  return {
    ditherPattern,
    overlayData,
    effectiveIntensity,
  };
}
