import { clampN } from './qr-generator-helpers';
import type { DitherAttemptPatch } from './dither-attempt-patch.type';
import type { ScanGateCtx } from './scan-gate-ctx.interface';
import { resolveScanGateIntensity } from './resolve-scan-gate-intensity';

export function buildScanGateDecodeRescuePatches(ctx: ScanGateCtx): DitherAttemptPatch[] {
  const { effectiveConfig, overlayComplexity, requestedOverlayIntensity, isPreviewScanGate } = ctx;
  const baseDark = clampN(effectiveConfig.darkMinOccupancy ?? 0.56, 0.5, 0.62);
  const baseLight = clampN(effectiveConfig.lightMaxOccupancy ?? 0.44, 0.38, 0.5);
  const baseBias = clampN(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.32);
  const previewMinIntensity = Math.max(8, Math.round(requestedOverlayIntensity * 0.42));
  const previewMaxDrop = Math.max(0, requestedOverlayIntensity - previewMinIntensity);
  const previewDropCap = clampN(
    Math.round(requestedOverlayIntensity * (0.58 - overlayComplexity * 0.12)),
    18,
    58
  );
  const rescueStep = overlayComplexity >= 0.65 ? 4 : 5;
  const rescueMaxDrop = isPreviewScanGate
    ? Math.min(previewMaxDrop, previewDropCap)
    : clampN(46 - overlayComplexity * 10, 24, 46);
  const intensities: number[] = [];
  for (let drop = rescueStep; drop <= rescueMaxDrop; drop += rescueStep) {
    const intensity = resolveScanGateIntensity(ctx, drop, {
      minIntensity: isPreviewScanGate ? previewMinIntensity : 10,
      maxDrop: rescueMaxDrop,
    });
    if (intensity < requestedOverlayIntensity && !intensities.includes(intensity))
      intensities.push(intensity);
  }
  return intensities.map((overlayIntensity, idx) => ({
    darkMinOccupancy: clampN(baseDark + idx * 0.01, 0.5, 0.64),
    lightMaxOccupancy: clampN(baseLight - idx * 0.01, 0.36, 0.5),
    optimizeIterations: Math.max(4 + idx, effectiveConfig.optimizeIterations ?? 6),
    overlayIntensity,
    qrBitBiasStrength: clampN(baseBias + 0.1 + idx * 0.03 + overlayComplexity * 0.02, 0, 0.34),
  }));
}
