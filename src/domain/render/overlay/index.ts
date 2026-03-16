// Barrel: domain/render/overlay
export { applyWatermark } from "./apply-watermark";
export type { WatermarkPosition } from "./watermark.types";
export { getOverlayDitherKind } from "./get-overlay-dither-kind";
export { STORE_DEFAULT_DITHER } from "./store-default-dither";
export { getOverlayData, loadImageDataRGB } from "./overlay-data";
export { generateSubpixelMatrix, getSubpixelOverlayData } from "./overlay-subpixel";
export {
  applyGeometricTransforms,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  preprocessOverlay,
} from "./overlay";
