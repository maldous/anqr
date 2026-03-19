import type { QRCodeInstance, QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

export interface ShapeMaskCtx {
  ctx: CanvasRenderingContext2D;
  size: number;
  marginPx: number;
  moduleCount: number;
  effectiveModuleSize: number;
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  effectiveBgColor: string;
  getPatternFlags: (row: number, col: number) => number;
  createCanvasFn: (w: number, h: number) => Promise<HTMLCanvasElement | OffscreenCanvas>;
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void;
}
