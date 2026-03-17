// Barrel: re-export types needed by decomposed generator files
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
export type { OverlayModeResult } from "./render-modes.types";
