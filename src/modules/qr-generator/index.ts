/**
 * QR Generator Module
 * Re-exports from split module files
 */

import { createLogger } from "../../infra/logging/logger";

const _log = createLogger("GENERATE");

// Re-export GradientConfig from core types
export type { GradientConfig } from "../core/types";
// Cache utilities
export {
  alignmentCache,
  canvasHashCache,
  clearQRCaches,
  MemoCache,
  overlayDataCache,
  qrMatrixCache,
  registerCacheCleanup,
} from "./cache";
export type { QRCodeObject, QRMatrixCacheEntry, OverlayDataMatrix } from "./cache";
// Re-export CanvasFactory from canvas-factory
export type { CanvasFactory } from "../../platform/browser/canvas/canvas-factory";
// Canvas factory
export {
  CanvasPool,
  defaultBrowserCanvasFactory,
} from "../../platform/browser/canvas/canvas-factory";
// Color utilities
export {
  applyPaletteColor,
  applyPerModuleColor,
  darkenColor,
  ensureContrast,
  lightenColor,
} from "./color";
// Dithering
export {
  applyAdvancedDither,
  applyDitherToMatrix,
  applyTrueDither,
  distributeError,
  getDiffusionKernel,
} from "../../domain/render/dither/dithering";
// Backward-compatible alias for callers that imported blueNoiseCanvasFactory
export { defaultBrowserCanvasFactory as blueNoiseCanvasFactory } from "../../platform/browser/canvas/canvas-factory";
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
} from "../../domain/render/generator/drawing";
// ECC awareness
export { getEccWeight, isEccSafeToModify } from "../../domain/qr/spec/ecc";
// Image filters (re-exported from overlay module)
export {
  applyBoxBlur,
  applyCannyEdge,
  applySharpen,
  applySobelEdge,
} from "../../domain/render/filters/filters";
// QR-specific preprocessing
export {
  preprocessImageData,
  preprocessImageData as applyFiltersManual,
} from "../../domain/render/filters/filters-preprocess";
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
} from "../../domain/render/overlay/overlay";
// Pattern helpers
export {
  getAlignmentPositionsCached,
  isFormatInfo,
  isVersionInfo,
} from "../../domain/render/generator/pattern-helpers";
// Pixel matrix generation
export {
  generatePixelDecisionMatrix,
  getScaleFactor,
  prepareUnifiedOverlayData,
} from "../../domain/render/generator/pixel-matrix";
export { clearBaseMatrixCache } from "../../domain/render/generator/pixel-matrix-utils";
// Main QRGenerator class
export { QRGenerator } from "./qr-generator-class";
// Module render loop
export { clearFunctionalMapCache, renderModules } from "../../domain/render/generator/render-loop";
export type { OverlayModeResult } from "../../domain/render/generator/render-modes";
// Overlay mode rendering
export {
  applyQROverlayMode,
  computeDarkFactor,
  computeLightBlend,
} from "../../domain/render/generator/render-modes";
// Scaled QR rendering
export { generateScaledQR } from "../../domain/render/generator/scaled-render";
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
} from "./types";
export { INTRINSICALLY_SCALED_OVERLAY_MODES } from "./types";
// Utility functions
export { createSeededRandom, getContrastRatio, hashCanvasContent, hashString } from "./utils";
