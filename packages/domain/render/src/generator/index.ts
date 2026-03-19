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
export { INTRINSICALLY_SCALED_OVERLAY_MODES } from "@/modules/qr-generator/types";
export { QRGenerator, canvasHashCache } from "@/modules/qr-generator";
export type { OverlayModeResult } from "./render-modes.types";
export { computeDarkFactor } from "./compute-dark-factor";
export { computeLightBlend } from "./compute-light-blend";
export { applyQROverlayMode } from "./apply-qr-overlay-mode";
