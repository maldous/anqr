/**
 * QR Generator Module
 * Re-exports from split module files
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('GENERATE');

// Re-export GradientConfig from core
export type { GradientConfig } from '../core';
// Cache utilities
export {
  alignmentCache,
  canvasHashCache,
  clearQRCaches,
  MemoCache,
  overlayDataCache,
  qrMatrixCache,
} from './cache';
// Re-export CanvasFactory from canvas-factory
export type { CanvasFactory } from './canvas-factory';
// Canvas factory
export { CanvasPool, defaultBrowserCanvasFactory } from './canvas-factory';
// Color utilities
export {
  applyPaletteColor,
  applyPerModuleColor,
  darkenColor,
  ensureContrast,
  lightenColor,
} from './color';
// Dithering
export {
  applyAdvancedDither,
  applyDitherToMatrix,
  applyTrueDither,
  distributeError,
  getDiffusionKernel,
} from './dithering';
// Blue noise dithering for QR codes
export {
  defaultBrowserCanvasFactory as blueNoiseCanvasFactory,
  generateBlueNoiseDithered,
} from './dithering-blue';
// Drawing functions
export {
  createGradientFill,
  drawAlignmentPattern,
  drawCenterLogo,
  drawFinderModule,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
  drawHalftoneModule,
  drawModule,
  drawTimingModule,
  roundRect,
} from './drawing';
// ECC awareness
export { getEccWeight, isEccSafeToModify } from './ecc';
// Image filters (re-exported from overlay module)
export { applyBoxBlur, applyCannyEdge, applySharpen, applySobelEdge } from './filters';
// QR-specific preprocessing
export {
  preprocessImageData,
  preprocessImageData as applyFiltersManual,
} from './filters-preprocess';
// Overlay processing
export {
  applyGeometricTransforms,
  generateSubpixelMatrix,
  getOverlayData,
  getSubpixelOverlayData,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  loadImageDataRGB,
  preprocessOverlay,
} from './overlay';
// Pattern helpers
export { getAlignmentPositionsCached, isFormatInfo, isVersionInfo } from './pattern-helpers';
// Pixel matrix generation
export {
  generatePixelDecisionMatrix,
  getScaleFactor,
  prepareUnifiedOverlayData,
} from './pixel-matrix';
export { clearBaseMatrixCache } from './pixel-matrix-utils';
// Main QRGenerator class
export { QRGenerator } from './qr-generator-class';
// Module render loop
export { clearFunctionalMapCache, renderModules } from './render-loop';
export type { OverlayModeResult } from './render-modes';
// Overlay mode rendering
export { applyQROverlayMode, computeDarkFactor, computeLightBlend } from './render-modes';
// Scaled QR rendering
export { generateScaledQR } from './scaled-render';
// Types from local types.ts
export type {
  Canvas2DContext,
  CanvasElement,
  CreateCanvasFn,
  DiffusionKernel,
  OverlayData,
  OverlayModeResult as OverlayModeResultType,
  PixelDecisionMatrix,
  PixelDecisionResult,
  QRCodeInstance,
  QRGeneratorConfig,
  QRMatrixResult,
  ReleaseCanvasFn,
  RGB,
  RGBWithMeta,
} from './types';
export { INTRINSICALLY_SCALED_OVERLAY_MODES } from './types';
// Utility functions
export { createSeededRandom, getContrastRatio, hashCanvasContent, hashString } from './utils';
