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
  RGB,
  Canvas2DContext,
  CanvasElement,
  DiffusionKernel,
} from "@/modules/qr-generator/types";
export { INTRINSICALLY_SCALED_OVERLAY_MODES } from "@/modules/qr-generator/types";
export { QRGenerator } from "@/modules/qr-generator/qr-generator-class";
export { canvasHashCache } from "@/modules/qr-generator/canvas-hash-cache";
export type { OverlayModeResult } from "./render-modes.types";
export { computeDarkFactor } from "./compute-dark-factor";
export { computeLightBlend } from "./compute-light-blend";
export { applyQROverlayMode } from "./apply-qr-overlay-mode";
