import type { DitherAttemptPatch, ScanGateCtx } from './qr-generator-scan-gate';

export function isAggressiveScanPatch(
  ctx: ScanGateCtx,
  patch: DitherAttemptPatch,
  cacheIntensityFloor: number
): boolean {
  const { effectiveConfig, requestedOverlayIntensity, overlayComplexity } = ctx;
  if (effectiveConfig.preserveFinders === false && patch.preserveFinders === true) return true;
  const patchIntensity = patch.overlayIntensity ?? requestedOverlayIntensity;
  if (patchIntensity < cacheIntensityFloor) return true;
  const patchBias = patch.qrBitBiasStrength ?? effectiveConfig.qrBitBiasStrength ?? 0.04;
  if (patchBias > 0.34 + overlayComplexity * 0.02) return true;
  if ((patch.darkMinOccupancy ?? 0) > 0.64) return true;
  if ((patch.lightMaxOccupancy ?? 1) < 0.36) return true;
  return false;
}
