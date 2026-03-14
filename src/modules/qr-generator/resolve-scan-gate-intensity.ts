import { clampN } from './qr-generator-helpers';
import type { ScanGateCtx } from './qr-generator-scan-gate';

export function resolveScanGateIntensity(
  ctx: ScanGateCtx,
  rawDrop: number,
  options?: { minIntensity?: number; maxDrop?: number }
): number {
  const { overlayComplexity, requestedOverlayIntensity, isPreviewScanGate } = ctx;
  const complexityScale = overlayComplexity >= 0.65 ? 0.75 : 1;
  const scaledDrop = Math.round(rawDrop * complexityScale);
  const defaultMaxDrop = isPreviewScanGate
    ? clampN(22 - overlayComplexity * 6, 14, 22)
    : clampN(36 - overlayComplexity * 10, 22, 36);
  const maxDrop = options?.maxDrop ?? defaultMaxDrop;
  const upperBound = requestedOverlayIntensity;
  const minIntensityRaw = options?.minIntensity ?? (isPreviewScanGate ? 16 : 12);
  const minIntensity = Math.min(minIntensityRaw, upperBound);
  const boundedDrop = Math.min(scaledDrop, maxDrop);
  return clampN(requestedOverlayIntensity - boundedDrop, minIntensity, upperBound);
}
