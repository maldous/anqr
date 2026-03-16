import type { QRCodeInstance, QRGeneratorConfig } from "./types";

export interface ConstraintCtx {
  qr: QRCodeInstance;
  matrixBits: Uint8Array;
  desire: Float32Array;
  moduleCount: number;
  scale: number;
  scaledSize: number;
  version: number;
  config: QRGeneratorConfig;
  total: number;
  centerRadius: number;
  centerArea: number;
  moduleCenter: number;
  baseDarkMin: number;
  baseLightMax: number;
  strictScanGate: boolean;
  finderBlendGuidance: boolean;
  occViolationWeight: number;
  centerViolationWeight: number;
  scanScoreWeight: number;
  artPenaltyWeight: number;
  edgeBandPenalty: number;
  centerPixelBonus: number;
  occupancies: number[][];
  centerOcc: number[][];
  darkMinMap: number[][];
  lightMaxMap: number[][];
  darkCenterMinMap: number[][];
  lightCenterMaxMap: number[][];
  locked: boolean[][];
}
