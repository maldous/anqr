/**
 * Overlay Module
 * Image processing for QR code overlays
 * Canonical source for image filters used by overlay and qr-generator modules
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('OVERLAY');

export type { CropRegion as CropHandlerRegion } from './crop-handler';
// Crop Handler
export { CropHandler, type CropHandlerOptions } from './crop-handler';
// Overlay filters (canonical source - qr-generator imports from here)
export {
  applyColorMode,
  applyFilters,
  blur,
  brightness,
  type ColorMode,
  cannyEdge,
  clamp,
  clamp01,
  contrast,
  convolve,
  copyImageData,
  duotone,
  emboss,
  type FilterOptions,
  gamma,
  gaussianBlur,
  getBrightnessMap,
  getRGBMap,
  grayscale,
  type HSL,
  hslToRgb,
  hueRotate,
  invert,
  posterize,
  type RGB,
  type RGBA,
  rgbToGray,
  rgbToHsl,
  saturation,
  sharpen,
  sobelEdge,
  threshold,
} from './overlay-filters';
// Processor
export {
  applyCanvasBlendMode,
  applyOverlayDither,
  applyOverlayDitherForQR,
  type CropRegion,
  cropOverlayImage,
  DEFAULT_MOBILE_DITHER,
  type DiffusionKernel,
  type DitherKind,
  extractOverlayBrightnessData,
  extractOverlayRGBData,
  type FitMode,
  fitOverlayImage,
  flipOverlayCanvas,
  getOverlayDitherKind,
  loadImageFromDataUrl,
  loadImageFromFile,
  loadImageFromUrl,
  type OrderedMatrix,
  type OverlayDitherOptions,
  type OverlayMode,
  type OverlayOptions,
  type OverlayType,
  type ProcessedOverlay,
  processOverlay,
  rotateOverlayCanvas,
  STORE_DEFAULT_DITHER,
} from './processor';
// Watermark
export {
  applyWatermark,
  applyWatermarkBlendMode,
  applyWatermarkCenterLogo,
  calculateWatermarkPositions,
  renderPatternWatermark,
  renderTextWatermark,
  Watermark,
  type WatermarkBlend,
  type WatermarkKind,
  type WatermarkOptions,
  type WatermarkPosition,
  type WatermarkResult,
} from './watermark';
