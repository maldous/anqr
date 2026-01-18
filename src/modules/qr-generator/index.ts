/**
 * QR Generator Module
 * Re-exports from split module files
 */

// Cache utilities
export { MemoCache, alignmentCache, canvasHashCache, clearQRCaches, overlayDataCache, qrMatrixCache } from './cache';

// Canvas factory
export { defaultBrowserCanvasFactory } from './canvas-factory';

// Utility functions
export { createSeededRandom, getContrastRatio, hashCanvasContent, hashString } from './utils';

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

// Image filters (re-exported from overlay module)
export {
  applyBoxBlur,
  applySharpen,
  applySobelEdge,
  applyCannyEdge,
} from './filters';

// QR-specific preprocessing
export { preprocessImageData, preprocessImageData as applyFiltersManual } from './filters-preprocess';

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

// ECC awareness
export { getEccWeight, isEccSafeToModify } from './ecc';

// Pattern helpers
export { getAlignmentPositions, isFormatInfo, isVersionInfo } from './pattern-helpers';

// Pixel matrix generation
export { generatePixelDecisionMatrix, getScaleFactor, prepareUnifiedOverlayData } from './pixel-matrix';

// Overlay mode rendering
export { applyOverlayMode } from './render-modes';
export type { OverlayModeResult } from './render-modes';

// Module render loop
export { renderModules } from './render-loop';

// Scaled QR rendering
export { generateScaledQR } from './scaled-render';

// Main QRGenerator class
export { QRGenerator } from './QRGenerator';

// Types from local types.ts
export type {
  QRCodeInstance,
  QRMatrixResult,
  RGB,
  OverlayData,
  PixelDecisionResult,
  QRGeneratorConfig,
  RGBWithMeta,
  PixelDecisionMatrix,
  OverlayModeResult as OverlayModeResultType,
  DiffusionKernel,
  CreateCanvasFn,
  CanvasElement,
  Canvas2DContext,
} from './types';

// Re-export CanvasFactory from canvas-factory
export type { CanvasFactory } from './canvas-factory';

// Re-export GradientConfig from core
export type { GradientConfig } from '../core';

// Blue noise dithering for QR codes
export { generateBlueNoiseDithered, defaultBrowserCanvasFactory as blueNoiseCanvasFactory } from './internal/blue-noise';
