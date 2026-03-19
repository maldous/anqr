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
} from "@/domain/render/qr-generator-shared";
export type { OverlayModeResult } from "./render-modes.types";
