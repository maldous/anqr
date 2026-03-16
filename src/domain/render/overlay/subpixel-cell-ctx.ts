import type { QRCodeObject } from "../../../modules/qr-generator/cache";
import type { QRGeneratorConfig } from "../../../modules/qr-generator/types";

export interface SubpixelCellCtx {
  qr: QRCodeObject;
  config: QRGeneratorConfig;
  brightness: number[][];
  colors: { r: number; g: number; b: number }[][];
  actualScale: number;
  centerIdx: number;
  neutralColor: { r: number; g: number; b: number } | null;
  useHalftone: boolean;
  finderOverride: string;
  moduleCount: number;
  version: number;
  intensity: number;
}
