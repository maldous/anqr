import type { Canvas2DContext } from "./canvas.types";
import type { OverlayData } from "./overlay.types";
import type { RGBWithMeta } from "./color.types";
import type { QRGeneratorConfig } from "./config.types";

export interface QRCodeInstance {
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
  addData(data: string, mode?: string): void;
  make(maskPattern?: number): void;
}

export interface QRCodeObject {
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
}

export interface RenderModulesOptions {
  ctx: Canvas2DContext;
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  moduleCount: number;
  moduleSize: number;
  margin: number;
  overlayData: OverlayData | null;
  ditherPattern: boolean[][] | null;
  effectiveIntensity: number;
  skipMask: Uint8Array;
  version: number;
  gradientFill: CanvasGradient | null;
  useGradient: boolean;
}

export interface QRMatrixResult {
  matrix: boolean[][];
  moduleCount: number;
}

export interface PixelDecisionMatrix {
  matrix: boolean[][];
  colors: (RGBWithMeta | null)[][];
  scale: number;
  overlayData: OverlayData | null;
  effectiveIntensity: number;
}

export type PixelDecisionResult = PixelDecisionMatrix;
