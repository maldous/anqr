import type { QRCodeInstance, QRGeneratorConfig } from "../../../../modules/qr-generator/types";

export interface StructuralPreservationCtx {
  ctx: CanvasRenderingContext2D;
  marginPx: number;
  moduleCount: number;
  effectiveModuleSize: number;
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  version: number;
  forceBinaryFunctionPatterns: boolean;
  preserveFinders: boolean;
  preserveTiming: boolean;
  preserveAlignment: boolean;
  protectFormat: boolean;
  protectVersion: boolean;
  effectiveFgColor: string;
  effectiveBgColor: string;
  useGradient: boolean;
  gradientFill: string | CanvasGradient | null;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  getPatternFlags: (row: number, col: number) => number;
  debug: boolean;
}
