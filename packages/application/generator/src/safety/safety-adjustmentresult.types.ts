/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Safety adjustment result interface.
 */

import type { EccLevel } from "./safety-ecclevel.types";

export interface SafetyAdjustmentResult {
  modulePx: number;
  quietZone: number;
  intensity: number;
  ecc: EccLevel;
  warnings: string[];
}
