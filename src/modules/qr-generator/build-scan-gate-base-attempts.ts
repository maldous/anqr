import { clampN } from './qr-generator-helpers';
import type { DitherAttemptPatch, ScanGateCtx } from './qr-generator-scan-gate';
import { resolveScanGateIntensity } from './resolve-scan-gate-intensity';

export function buildScanGateBaseAttempts(ctx: ScanGateCtx): DitherAttemptPatch[] {
  const {
    effectiveConfig,
    overlayComplexity,
    skipScanGateEscalation,
    isScanGateDisabled,
    isPreviewScanGate,
  } = ctx;
  const useFinderRelaxedAttempts = skipScanGateEscalation && !isScanGateDisabled;

  if (useFinderRelaxedAttempts) {
    return [
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.46, 0.4, 0.56),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.54, 0.44, 0.6),
        optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 8, { minIntensity: 18, maxDrop: 24 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.03 + overlayComplexity * 0.01,
          0,
          0.24
        ),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.5, 0.46, 0.58),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.5, 0.42, 0.54),
        optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 16, { minIntensity: 16, maxDrop: 26 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.05 + overlayComplexity * 0.015,
          0,
          0.24
        ),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.54, 0.5, 0.6),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.46, 0.4, 0.5),
        optimizeIterations: Math.max(7, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 24, { minIntensity: 14, maxDrop: 30 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.07 + overlayComplexity * 0.02,
          0,
          0.24
        ),
      },
    ];
  }

  if (isPreviewScanGate) {
    return [
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.42, 0.36, 0.56),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.58, 0.44, 0.64),
        optimizeIterations: Math.max(2, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 0, { minIntensity: 24, maxDrop: 0 }),
        qrBitBiasStrength: clampN(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.24),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.48, 0.44, 0.56),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.52, 0.44, 0.56),
        optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 10, { minIntensity: 20, maxDrop: 14 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.04 + overlayComplexity * 0.01,
          0,
          0.28
        ),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.52, 0.48, 0.58),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.48, 0.42, 0.52),
        optimizeIterations: Math.max(5, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 16, { minIntensity: 16, maxDrop: 18 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.07 + overlayComplexity * 0.015,
          0,
          0.28
        ),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.55, 0.5, 0.6),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.45, 0.4, 0.5),
        optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 22, { minIntensity: 12, maxDrop: 22 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.1 + overlayComplexity * 0.02,
          0,
          0.3
        ),
      },
    ];
  }

  return [
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.42, 0.36, 0.56),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.58, 0.44, 0.64),
      optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 0, { minIntensity: 20, maxDrop: 0 }),
      qrBitBiasStrength: clampN(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.24),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.5, 0.5, 0.56),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.5, 0.44, 0.5),
      optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 18, { minIntensity: 16, maxDrop: 26 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.03 + overlayComplexity * 0.01,
        0,
        0.24
      ),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.53, 0.51, 0.56),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.47, 0.44, 0.49),
      optimizeIterations: Math.max(7, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 26, { minIntensity: 14, maxDrop: 30 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.06 + overlayComplexity * 0.015,
        0,
        0.24
      ),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.55, 0.53, 0.58),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.45, 0.42, 0.47),
      optimizeIterations: Math.max(8, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 34, { minIntensity: 12, maxDrop: 32 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.09 + overlayComplexity * 0.02,
        0,
        0.24
      ),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.57, 0.55, 0.6),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.43, 0.4, 0.45),
      optimizeIterations: Math.max(9, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 42, { minIntensity: 10, maxDrop: 34 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.12 + overlayComplexity * 0.025,
        0,
        0.24
      ),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.58, 0.56, 0.62),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.42, 0.38, 0.44),
      optimizeIterations: Math.max(10, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 50, { minIntensity: 8, maxDrop: 36 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.16 + overlayComplexity * 0.03,
        0,
        0.28
      ),
    },
  ];
}
