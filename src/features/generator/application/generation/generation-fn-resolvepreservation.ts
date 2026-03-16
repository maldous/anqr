/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Resolve overlay preservation options from safety + user config.
 */

import type { ResolvedPreservationOptions } from "@/features/generator/application/generation/generation-type-preservation";

export function resolveOverlayPreservationOptions(params: {
  overlayEnabled: boolean;
  overlayMode: string | undefined;
  safetyMode: string;
  safetyLockFinders: boolean;
  safetyLockTiming: boolean;
  safetyLockAlign: boolean;
  safetyLockFormat: boolean;
  safetyLockVersion: boolean;
  preserveFinders: boolean;
  preserveTiming: boolean;
  preserveAlignment: boolean;
  protectFormatInfo: boolean;
  protectVersionInfo: boolean;
}): ResolvedPreservationOptions {
  const isDitheredOverlayMode =
    params.overlayMode === "dithered" ||
    params.overlayMode === "blue_noise" ||
    params.overlayMode === "blue-noise";
  const applySafetyLocks =
    params.overlayEnabled && params.safetyMode !== "off" && !isDitheredOverlayMode;

  return {
    preserveFinders: applySafetyLocks
      ? params.safetyLockFinders || params.preserveFinders
      : params.preserveFinders,
    preserveTiming: applySafetyLocks
      ? params.safetyLockTiming || params.preserveTiming
      : params.preserveTiming,
    preserveAlignment: applySafetyLocks
      ? params.safetyLockAlign || params.preserveAlignment
      : params.preserveAlignment,
    protectFormatInfo: applySafetyLocks
      ? params.safetyLockFormat || params.protectFormatInfo
      : params.protectFormatInfo,
    protectVersionInfo: applySafetyLocks
      ? params.safetyLockVersion || params.protectVersionInfo
      : params.protectVersionInfo,
  };
}
