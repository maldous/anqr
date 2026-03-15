/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Safety adjustment result interface.
 */

import type { EccLevel } from '@/features/generator/application/safety/safety-type-ecclevel';

export interface SafetyAdjustmentResult {
  modulePx: number;
  quietZone: number;
  intensity: number;
  ecc: EccLevel;
  warnings: string[];
}
