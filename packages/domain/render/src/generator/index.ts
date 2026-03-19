// Barrel: domain/render/generator
export type {
  QRGeneratorConfig,
  QRCodeInstance,
  QRMatrixResult,
  OverlayData,
  CreateCanvasFn,
  ReleaseCanvasFn,
  PixelDecisionMatrix,
  PixelDecisionResult,
  RGBWithMeta,
  Canvas2DContext,
  CanvasElement,
} from "@/domain/render/qr-generator-shared";
export type { OverlayModeResult } from "./render-modes.types";
export {
  createGradientFill,
  drawAlignmentPattern,
  drawCenterLogo,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
} from "./drawing";
export { computeDarkFactor } from "./compute-dark-factor";
export { computeLightBlend } from "./compute-light-blend";
export { alignmentCache } from "./alignment-cache";
export { getAlignmentPositionsCached } from "./pattern-helpers";
export { clearBaseMatrixCache, curveIntensity } from "./pixel-matrix-utils";
export { getScaleFactor, prepareUnifiedOverlayData } from "./pixel-matrix";
export { registerCacheCleanup } from "./register-cache-cleanup";
export { runRegisteredCacheCleanups } from "./run-registered-cache-cleanups";
export { renderModules } from "./render-loop";
export { applyQROverlayMode } from "./apply-qr-overlay-mode";
export { generateScaledQR } from "./scaled-render";
