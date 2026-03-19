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
export type { CanvasFactory } from "@/domain/render/canvas";
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
} from "@/domain/render/dither";
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
} from "@/domain/render/qr-render";
export { getEccWeight, isEccSafeToModify } from "../spec/ecc";
export {
  applyBoxBlur,
  applyCannyEdge,
  applySharpen,
  applySobelEdge,
  preprocessImageData,
  preprocessImageData as applyFiltersManual,
} from "@/domain/render/filters";
export {
  applyGeometricTransforms,
  generateSubpixelMatrix,
  getOverlayData,
  getSubpixelOverlayData,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  loadImageDataRGB,
  preprocessOverlay,
} from "@/domain/render/overlay";
export { getAlignmentPositionsCached } from "@/domain/render/qr-render";
export { isFormatInfo, isVersionInfo } from "@/domain/qr/spec";
export {
  generatePixelDecisionMatrix,
  getScaleFactor,
  prepareUnifiedOverlayData,
} from "@/domain/render/qr-render";
export { clearBaseMatrixCache } from "@/domain/render/generator";
export { QRGenerator } from "./qr-generator-class";
export { clearFunctionalMapCache, renderModules } from "@/domain/render/qr-render";
export type { OverlayModeResult } from "@/domain/render/generator";
export {
  applyQROverlayMode,
  computeDarkFactor,
  computeLightBlend,
} from "@/domain/render/generator";
export { generateScaledQR } from "@/domain/render/qr-render";
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
