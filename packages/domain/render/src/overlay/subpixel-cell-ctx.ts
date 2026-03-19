import type { QRCodeObject, QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

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
