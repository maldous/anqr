// Barrel: domain/render/overlay
export { applyWatermark } from "./apply-watermark";
export { applyFilters, copyImageData, gamma, gaussianBlur } from "./overlay-filters";
export { canvasHashCache } from "./canvas-hash-cache";
export { hashCanvasContent } from "./hash-canvas-content";
export type { ColorMode } from "./overlay-filters.types";
export type { WatermarkPosition } from "./watermark.types";
export { getOverlayDitherKind } from "./get-overlay-dither-kind";
export { STORE_DEFAULT_DITHER } from "./store-default-dither";
export { getOverlayData, loadImageDataRGB } from "./overlay-data";
export { overlayDataCache } from "./overlay-data-cache";
export { getOverlayBrightness, getOverlayColor } from "./overlay-data-packed";
export { generateSubpixelMatrix, getSubpixelOverlayData } from "./overlay-subpixel";
export {
  applyGeometricTransforms,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  preprocessOverlay,
} from "./overlay";
