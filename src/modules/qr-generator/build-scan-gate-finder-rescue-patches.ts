import { clampN } from "./qr-generator-helpers";
import type { DitherAttemptPatch } from "./dither-attempt-patch.type";
import type { ScanGateCtx } from "./scan-gate-ctx.interface";
import { resolveScanGateIntensity } from "./resolve-scan-gate-intensity";

export function buildScanGateFinderRescuePatches(ctx: ScanGateCtx): DitherAttemptPatch[] {
  const {
    effectiveConfig,
    overlayComplexity,
    requestedOverlayIntensity,
    isPreviewScanGate,
    isScanGateDisabled,
  } = ctx;
  if (effectiveConfig.preserveFinders !== false || isScanGateDisabled) return [];
  const baseDark = clampN(effectiveConfig.darkMinOccupancy ?? 0.56, 0.52, 0.66);
  const baseLight = clampN(effectiveConfig.lightMaxOccupancy ?? 0.44, 0.34, 0.48);
  const baseBias = clampN(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.32);
  const previewMinIntensity = Math.max(6, Math.round(requestedOverlayIntensity * 0.32));
  const previewMaxDrop = Math.max(0, requestedOverlayIntensity - previewMinIntensity);
  const previewDropCap = clampN(
    Math.round(requestedOverlayIntensity * (0.66 - overlayComplexity * 0.12)),
    22,
    64,
  );
  const rescueStep = overlayComplexity >= 0.65 ? 4 : 5;
  const rescueMaxDrop = isPreviewScanGate
    ? Math.min(previewMaxDrop, previewDropCap)
    : clampN(52 - overlayComplexity * 12, 26, 52);
  const intensities: number[] = [];
  for (let drop = rescueStep; drop <= rescueMaxDrop; drop += rescueStep) {
    const intensity = resolveScanGateIntensity(ctx, drop, {
      minIntensity: isPreviewScanGate ? previewMinIntensity : 8,
      maxDrop: rescueMaxDrop,
    });
    if (intensity < requestedOverlayIntensity && !intensities.includes(intensity))
      intensities.push(intensity);
  }
  return intensities.map((overlayIntensity, idx) => ({
    preserveFinders: true,
    darkMinOccupancy: clampN(baseDark + idx * 0.01, 0.52, 0.7),
    lightMaxOccupancy: clampN(baseLight - idx * 0.01, 0.3, 0.48),
    optimizeIterations: Math.max(6 + idx, effectiveConfig.optimizeIterations ?? 6),
    overlayIntensity,
    qrBitBiasStrength: clampN(baseBias + 0.12 + idx * 0.03 + overlayComplexity * 0.025, 0, 0.36),
  }));
}
