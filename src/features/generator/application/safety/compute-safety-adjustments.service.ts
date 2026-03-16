/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Compute full safety adjustments for generation.
 */

import { adjustOverlayIntensity } from "@/features/generator/application/safety/adjust-overlay-intensity.service";
import type { SafetyAdjustmentResult } from "@/features/generator/application/safety/safety-adjustmentresult.types";
import type { EccLevel } from "@/features/generator/application/safety/safety-ecclevel.types";

export function computeSafetyAdjustments(params: {
  safetyMode: string;
  minModulePx: number;
  minQuietZoneModules: number;
  maxOverlayIntensityByEcc: Record<string, number>;
  modulePx: number;
  moduleGapPercent: number;
  moduleStyle: string;
  quietZoneModules: number;
  ecc: EccLevel;
  overlayEnabled: boolean;
  overlayIntensity: number;
  pickEcc: boolean;
  reduceIntensityUntilSafe: boolean;
  autoPickedEcc: EccLevel;
  effectiveEcc: EccLevel;
}): SafetyAdjustmentResult {
  const warnings: string[] = [];
  let adjustedModulePx = params.modulePx;
  let adjustedQuietZone = params.quietZoneModules;
  let adjustedIntensity = params.overlayIntensity;

  if (params.safetyMode !== "off") {
    if (params.modulePx < params.minModulePx) {
      adjustedModulePx = params.minModulePx;
      warnings.push(`Module size increased to ${params.minModulePx}px for scannability`);
    }

    if (params.quietZoneModules < params.minQuietZoneModules) {
      adjustedQuietZone = params.minQuietZoneModules;
      warnings.push(`Quiet zone increased to ${params.minQuietZoneModules} modules`);
    }

    const maxSafeIntensity = params.maxOverlayIntensityByEcc[params.effectiveEcc] ?? 50;
    const intensityResult = adjustOverlayIntensity({
      safetyMode: params.safetyMode,
      overlayEnabled: params.overlayEnabled,
      overlayIntensity: params.overlayIntensity,
      maxSafeIntensity,
      reduceIntensityUntilSafe: params.reduceIntensityUntilSafe,
      effectiveEcc: params.effectiveEcc,
    });
    adjustedIntensity = intensityResult.intensity;
    warnings.push(...intensityResult.warnings);

    if (params.moduleGapPercent > 20) {
      warnings.push("Large module gaps may affect QR readability");
    }

    if (params.moduleStyle === "dots" && params.moduleGapPercent > 10) {
      warnings.push("Dots with large gaps may be hard to scan");
    }
  }

  if (params.pickEcc && params.autoPickedEcc !== params.ecc) {
    warnings.push(`Auto-selected ECC level ${params.autoPickedEcc} for optimal balance`);
  }

  return {
    modulePx: adjustedModulePx,
    quietZone: adjustedQuietZone,
    intensity: adjustedIntensity,
    ecc: params.effectiveEcc,
    warnings,
  };
}
