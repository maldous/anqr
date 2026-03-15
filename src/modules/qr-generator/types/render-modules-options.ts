import type { Canvas2DContext } from './canvas-2d-context';
import type { OverlayData } from './overlay-data';
import type { QRCodeInstance } from './qr-code-instance';
import type { QRGeneratorConfig } from './qr-generator-config';

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
