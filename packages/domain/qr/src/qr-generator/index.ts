export type { GradientConfig } from "../core/types";
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
export type { CanvasFactory } from "@/domain/render/canvas-factory.types";
export { CanvasPool } from "./canvas-pool";
export {
  applyPaletteColor,
  applyPerModuleColor,
  darkenColor,
  ensureContrast,
  lightenColor,
} from "./color";
export {
  applyAdvancedDither,
  applyDitherToMatrix,
  applyTrueDither,
  distributeError,
  getDiffusionKernel,
} from "../../../render/src/dither/dithering";
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
} from "../../../render/src/generator/drawing";
export { getEccWeight, isEccSafeToModify } from "../spec/ecc";
export {
  applyBoxBlur,
  applyCannyEdge,
  applySharpen,
  applySobelEdge,
  preprocessImageData,
  preprocessImageData as applyFiltersManual,
} from "../../../render/src/filters/filters";
export {
  applyGeometricTransforms,
  generateSubpixelMatrix,
  getOverlayData,
  getSubpixelOverlayData,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  loadImageDataRGB,
  preprocessOverlay,
} from "../../../render/src/overlay/overlay";
export {
  getAlignmentPositionsCached,
  isFormatInfo,
  isVersionInfo,
} from "../../../render/src/generator/pattern-helpers";
export {
  generatePixelDecisionMatrix,
  getScaleFactor,
  prepareUnifiedOverlayData,
} from "../../../render/src/generator/pixel-matrix";
export { clearBaseMatrixCache } from "../../../render/src/generator/pixel-matrix-utils";
export { QRGenerator } from "./qr-generator-class";
export { clearFunctionalMapCache, renderModules } from "../../../render/src/generator/render-loop";
export type { OverlayModeResult } from "../../../render/src/generator/render-modes";
export {
  applyQROverlayMode,
  computeDarkFactor,
  computeLightBlend,
} from "../../../render/src/generator/render-modes";
export { generateScaledQR } from "../../../render/src/generator/scaled-render";
export type { AnyCanvas } from "./any-canvas";
export type {
  ApplyOverlayModeOptions,
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
  RenderModulesOptions,
  RGB,
  RGBWithMeta,
} from "./types";
export { INTRINSICALLY_SCALED_OVERLAY_MODES } from "./types";
export {
  createSeededRandom,
  getContrastRatio,
  hashCanvasContent,
  hashString,
  validateColor,
} from "./utils";
