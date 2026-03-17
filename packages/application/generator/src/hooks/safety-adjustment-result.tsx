import type { EccLevel } from "./ecc-level";

export interface SafetyAdjustmentResult {
  modulePx: number;
  quietZone: number;
  intensity: number;
  ecc: EccLevel;
  warnings: string[];
}
