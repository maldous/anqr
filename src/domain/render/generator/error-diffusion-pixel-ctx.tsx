import type { DiffusionKernelDef } from '../dither/kernels';
import type { QRCodeInstance, QRGeneratorConfig } from './types';

export interface ErrorDiffusionPixelCtx {
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  data: Uint8ClampedArray;
  scaledSize: number;
  scale: number;
  version: number;
  moduleCount: number;
  mix: number;
  thresholdOnly: boolean;
  useColorDither: boolean;
  qrBitBiasStrength: number;
  kernel: DiffusionKernelDef;
  sampleThreshold: (x: number, y: number, sampleIdx: number, overlayDark: number) => number;
}
