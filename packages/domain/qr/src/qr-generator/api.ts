/**
 * QR Generator Module - Public API Manifest
 *
 * This file documents all public exports from the qr-generator module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from "@/domain/logging";

const _log = createLogger("GENERATE");

// Main generator
export const GENERATOR_API = ["QRGenerator", "generateScaledQR", "renderModules"] as const;

// Drawing functions
export const DRAWING_API = [
  "createGradientFill",
  "drawAlignmentPattern",
  "drawCenterLogo",
  "drawFinderModule",
  "drawFinderPatternComplete",
  "drawFrame",
  "drawFrameBackground",
  "drawHalftoneModule",
  "drawModule",
  "drawTimingModule",
  "roundRect",
] as const;

// Overlay processing
export const OVERLAY_API = [
  "applyGeometricTransforms",
  "generateSubpixelMatrix",
  "getOverlayData",
  "getSubpixelOverlayData",
  "hasGeometricTransforms",
  "hasPreprocessingOptions",
  "loadImageDataRGB",
  "preprocessOverlay",
  "applyQROverlayMode",
  "computeDarkFactor",
  "computeLightBlend",
] as const;

// Pixel matrix
export const PIXEL_MATRIX_API = [
  "clearBaseMatrixCache",
  "generatePixelDecisionMatrix",
  "getScaleFactor",
  "clearFunctionalMapCache",
  "prepareUnifiedOverlayData",
] as const;

// Dithering
export const DITHER_API = [
  "applyAdvancedDither",
  "applyDitherToMatrix",
  "applyTrueDither",
  "distributeError",
  "getDiffusionKernel",
] as const;

// Color utilities
export const COLOR_API = [
  "applyPaletteColor",
  "applyPerModuleColor",
  "darkenColor",
  "ensureContrast",
  "lightenColor",
] as const;

// ECC utilities
export const ECC_API = ["getEccWeight", "isEccSafeToModify"] as const;

// Filters
export const FILTER_API = [
  "applyBoxBlur",
  "applyCannyEdge",
  "applySharpen",
  "applySobelEdge",
  "preprocessImageData",
  "applyFiltersManual",
] as const;

// Pattern helpers
export const PATTERN_API = [
  "getAlignmentPositionsCached",
  "isFormatInfo",
  "isVersionInfo",
] as const;

// Cache
export const CACHE_API = [
  "alignmentCache",
  "canvasHashCache",
  "clearQRCaches",
  "MemoCache",
  "overlayDataCache",
  "qrMatrixCache",
] as const;

// Utilities
export const UTILS_API = [
  "createSeededRandom",
  "getContrastRatio",
  "hashCanvasContent",
  "hashString",
] as const;

// Types
export const TYPES = [
  "Canvas2DContext",
  "CanvasElement",
  "CanvasFactory",
  "CreateCanvasFn",
  "DiffusionKernel",
  "GradientConfig",
  "OverlayData",
  "OverlayModeResult",
  "OverlayModeResultType",
  "PixelDecisionMatrix",
  "PixelDecisionResult",
  "QRCodeInstance",
  "QRGeneratorConfig",
  "QRMatrixResult",
  "RGB",
  "RGBWithMeta",
] as const;

// All public exports
export const PUBLIC_API = [
  ...GENERATOR_API,
  ...DRAWING_API,
  ...OVERLAY_API,
  ...PIXEL_MATRIX_API,
  ...DITHER_API,
  ...COLOR_API,
  ...ECC_API,
  ...FILTER_API,
  ...PATTERN_API,
  ...CACHE_API,
  ...UTILS_API,
] as const;
