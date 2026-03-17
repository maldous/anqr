import { generateBlueNoiseTile } from "../dither";
import type { QRCodeInstance, QRGeneratorConfig } from "./types";

export interface BlueNoisePixelCtx {
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  data: Uint8ClampedArray;
  scaledSize: number;
  scale: number;
  version: number;
  moduleCount: number;
  intensity: number;
  effectiveBitBias: number;
  scanGateActive: boolean;
  tile: ReturnType<typeof generateBlueNoiseTile>;
  tileSize: number;
}
