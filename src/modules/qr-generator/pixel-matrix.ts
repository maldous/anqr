/**
 * Pixel Decision Matrix Generation
 * Unified pixel-level decision making for all overlay modes
 * Re-exports from split module files
 */

import type { CanvasFactory } from './canvas-factory';
import { generateSubpixelMatrix } from './overlay';
import { generateDitherModeMatrix } from './pixel-matrix-dither';
import { generateBlueNoiseMatrix, generateDitheredMatrix } from './pixel-matrix-dithered';
import { generateStandardMatrix } from './pixel-matrix-standard';
import { generateBaseMatrix, getEffectiveIntensity, getScaleFactor } from './pixel-matrix-utils';
import type { PixelDecisionResult, QRCodeInstance, QRGeneratorConfig } from './types';

export { generateDitherModeMatrix, normalizeColors } from './pixel-matrix-dither';
export { generateBlueNoiseMatrix, generateDitheredMatrix } from './pixel-matrix-dithered';
export { prepareUnifiedOverlayData } from './pixel-matrix-overlay';
export { generateStandardMatrix } from './pixel-matrix-standard';
// Re-export utilities
export { generateBaseMatrix, getEffectiveIntensity, getScaleFactor } from './pixel-matrix-utils';

/**
 * UNIFIED PIXEL DECISION MATRIX
 * Generates pixel-level decisions for ALL overlay modes.
 * Returns a unified format that the render loop can use consistently.
 */
export async function generatePixelDecisionMatrix(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  moduleCount: number,
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>,
  canvasFactory: CanvasFactory
): Promise<PixelDecisionResult> {
  const overlayMode = config.overlayMode;
  const scale = getScaleFactor(overlayMode, config);
  const scaledSize = moduleCount * scale;

  // Apply per-ECC intensity limits
  const { effectiveIntensity, effectiveConfig } = getEffectiveIntensity(config);

  // Debug (targeted): only emit overlay-dither logs when explicitly enabled.
  if (config.debugOverlayDither) {
    console.log('[OverlayDither] pixel-matrix', {
      overlayMode,
      scale,
      scaledSize,
      hasOverlay: !!overlayCanvas,
      effectiveIntensity,
      colorMode: config.colorMode,
    });
  }

  // No overlay - return base QR matrix at requested scale
  if (overlayCanvas === null || overlayCanvas === undefined) {
    const { matrix, colors } = generateBaseMatrix(qr, scaledSize, scale);
    return { matrix, colors, scale, overlayData: null, effectiveIntensity };
  }

  // Route to mode-specific pixel generation
  switch (overlayMode) {
    case 'dithered':
      return generateDitheredMatrix(
        qr,
        config,
        overlayCanvas,
        moduleCount,
        scale,
        effectiveIntensity,
        effectiveConfig,
        createCanvasFn
      );

    case 'blue-noise':
    case 'blue_noise':
      return generateBlueNoiseMatrix(
        qr,
        config,
        overlayCanvas,
        moduleCount,
        scale,
        effectiveIntensity,
        canvasFactory,
        createCanvasFn
      );

    case 'subpixel':
    case 'subpixel-size': {
      // Generate NxN grid where center=QR data, surrounding=image
      const useHalftoneCenter = overlayMode === 'subpixel-size';
      return await generateSubpixelMatrix(
        qr,
        config,
        overlayCanvas,
        moduleCount,
        scale,
        useHalftoneCenter,
        createCanvasFn
      );
    }

    case 'dither':
    case 'extreme':
      return generateDitherModeMatrix(
        qr,
        config,
        overlayCanvas,
        moduleCount,
        effectiveIntensity,
        effectiveConfig,
        overlayMode,
        createCanvasFn
      );

    default:
      return generateStandardMatrix(
        qr,
        config,
        overlayCanvas,
        moduleCount,
        effectiveIntensity,
        effectiveConfig,
        createCanvasFn
      );
  }
}
