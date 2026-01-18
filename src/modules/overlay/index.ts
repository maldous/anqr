/**
 * Overlay Module
 * Image processing for QR code overlays
 * Canonical source for image filters used by overlay and qr-generator modules
 */

// Overlay filters (canonical source - qr-generator imports from here)
export {
  applyFilters,
  brightness,
  contrast,
  saturation,
  hueRotate,
  gamma,
  invert,
  grayscale,
  threshold,
  posterize,
  duotone,
  sharpen,
  blur,
  gaussianBlur,
  emboss,
  sobelEdge,
  cannyEdge,
  convolve,
  rgbToGray,
  hslToRgb,
  rgbToHsl,
  clamp,
  clamp01,
  copyImageData,
  getBrightnessMap,
  getRGBMap,
  applyColorMode,
  type RGB,
  type RGBA,
  type HSL,
  type FilterOptions,
} from './overlay-filters';

// Watermark
export {
  applyWatermark,
  applyWatermarkCenterLogo,
  renderTextWatermark,
  renderPatternWatermark,
  calculateWatermarkPositions,
  applyWatermarkBlendMode,
  Watermark,
  type WatermarkKind,
  type WatermarkPosition,
  type WatermarkBlend,
  type WatermarkOptions,
  type WatermarkResult,
} from './watermark';

// Crop Handler
export { CropHandler, type CropHandlerOptions } from './crop-handler';
export type { CropRegion as CropHandlerRegion } from './crop-handler';

// Processor
export {
  processOverlay,
  loadImageFromFile,
  loadImageFromUrl,
  loadImageFromDataUrl,
  cropOverlayImage,
  fitOverlayImage,
  rotateOverlayCanvas,
  flipOverlayCanvas,
  applyOverlayDither,
  applyOverlayDitherForQR,
  getOverlayDitherKind,
  extractOverlayBrightnessData,
  extractOverlayRGBData,
  applyCanvasBlendMode,
  DEFAULT_MOBILE_DITHER,
  STORE_DEFAULT_DITHER,
  type OverlayOptions,
  type OverlayDitherOptions,
  type ProcessedOverlay,
  type DitherKind,
  type DiffusionKernel,
  type OrderedMatrix,
  type CropRegion,
  type FitMode,
  type OverlayMode,
  type OverlayType,
} from './processor';
