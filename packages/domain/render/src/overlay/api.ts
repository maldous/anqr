/**
 * Overlay Module - Public API Manifest
 *
 * This file documents all public exports from the overlay module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from "@/infra/logging/logger";

const _log = createLogger("OVERLAY");

// Image loading
export const LOADING_API = [
  "loadImageFromFile",
  "loadImageFromUrl",
  "loadImageFromDataUrl",
] as const;

// Cropping and fitting
export const TRANSFORM_API = [
  "cropOverlayImage",
  "fitOverlayImage",
  "rotateOverlayCanvas",
  "flipOverlayCanvas",
] as const;

// Overlay filters
export const FILTER_API = [
  "applyFilters",
  "applyColorMode",
  "brightness",
  "contrast",
  "gamma",
  "blur",
  "gaussianBlur",
  "sharpen",
  "grayscale",
  "invert",
  "posterize",
  "threshold",
  "hueRotate",
  "saturation",
  "duotone",
  "emboss",
  "sobelEdge",
  "cannyEdge",
  "convolve",
  "copyImageData",
  "getBrightnessMap",
  "getRGBMap",
] as const;

// Overlay processing
export const PROCESSOR_API = [
  "processOverlay",
  "applyCanvasBlendMode",
  "applyOverlayDither",
  "applyOverlayDitherForQR",
  "extractOverlayBrightnessData",
  "extractOverlayRGBData",
  "getOverlayDitherKind",
] as const;

// Watermark
export const WATERMARK_API = [
  "applyWatermark",
  "applyWatermarkBlendMode",
  "applyWatermarkCenterLogo",
  "calculateWatermarkPositions",
  "renderPatternWatermark",
  "renderTextWatermark",
  "Watermark",
] as const;

// Crop handler
export const CROP_API = ["CropHandler"] as const;

// Utilities
export const UTILS_API = ["clamp", "clamp01", "rgbToGray", "rgbToHsl", "hslToRgb"] as const;

// Constants
export const CONSTANTS = ["DEFAULT_MOBILE_DITHER", "STORE_DEFAULT_DITHER"] as const;

// Types
export const TYPES = [
  "CropHandlerOptions",
  "CropHandlerRegion",
  "CropRegion",
  "DiffusionKernel",
  "DitherKind",
  "FilterOptions",
  "FitMode",
  "HSL",
  "OrderedMatrix",
  "OverlayDitherOptions",
  "OverlayMode",
  "OverlayOptions",
  "OverlayType",
  "ProcessedOverlay",
  "RGB",
  "RGBA",
  "WatermarkBlend",
  "WatermarkKind",
  "WatermarkOptions",
  "WatermarkPosition",
  "WatermarkResult",
] as const;

// All public exports
export const PUBLIC_API = [
  ...LOADING_API,
  ...TRANSFORM_API,
  ...FILTER_API,
  ...PROCESSOR_API,
  ...WATERMARK_API,
  ...CROP_API,
  ...UTILS_API,
  ...CONSTANTS,
] as const;
