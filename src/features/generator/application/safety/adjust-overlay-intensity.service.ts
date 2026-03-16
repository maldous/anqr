/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Adjust overlay intensity per safety mode.
 */

import type { EccLevel } from "@/features/generator/application/safety/safety-ecclevel.types";

export function adjustOverlayIntensity(params: {
  safetyMode: string;
  overlayEnabled: boolean;
  overlayIntensity: number;
  maxSafeIntensity: number;
  reduceIntensityUntilSafe: boolean;
  effectiveEcc: EccLevel;
}): { intensity: number; warnings: string[] } {
  const warnings: string[] = [];
  let adjusted = params.overlayIntensity;

  if (
    params.safetyMode === "strict" &&
    params.overlayEnabled &&
    params.overlayIntensity > params.maxSafeIntensity
  ) {
    adjusted = params.maxSafeIntensity;
    warnings.push(
      `Overlay intensity reduced to ${params.maxSafeIntensity}% for ECC level ${params.effectiveEcc}`,
    );
  } else if (
    params.safetyMode === "balanced" &&
    params.overlayEnabled &&
    params.overlayIntensity > params.maxSafeIntensity
  ) {
    warnings.push(
      `Overlay intensity (${params.overlayIntensity}%) may reduce scannability with ECC ${params.effectiveEcc}`,
    );
  }

  if (
    params.reduceIntensityUntilSafe &&
    params.overlayEnabled &&
    params.overlayIntensity > params.maxSafeIntensity
  ) {
    adjusted = params.maxSafeIntensity;
    warnings.push(
      `Auto-reduced overlay intensity to ${params.maxSafeIntensity}% for safe scanning`,
    );
  }

  return { intensity: adjusted, warnings };
}
