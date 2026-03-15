import type { QRCodeInstance, QRGeneratorConfig } from './types';
import { clamp01 } from './clamp01';
import { shouldLockModule } from './should-lock-module';
import { isFinderModuleOrSeparator } from './is-finder-module-or-separator';
import type { ConstraintCtx } from './constraint-ctx';

export function initConstraintContext(
  qr: QRCodeInstance,
  matrixBits: Uint8Array,
  desire: Float32Array,
  moduleCount: number,
  scale: number,
  scaledSize: number,
  version: number,
  config: QRGeneratorConfig
): { cctx: ConstraintCtx; maxIters: number } | null {
  const scanGateProfile = config.scanGateProfile ?? 'full';
  const strictScanGate = scanGateProfile === 'full';
  const baseDarkMin = clamp01(config.darkMinOccupancy ?? 0.38);
  const baseLightMax = clamp01(config.lightMaxOccupancy ?? 0.62);
  if (baseDarkMin <= 0.001 && baseLightMax >= 0.999) return null;

  const total = scale * scale;
  const maxIters = Math.max(1, Math.min(16, config.optimizeIterations ?? 8));
  const centerRadius = Math.max(1, Math.floor(scale * (strictScanGate ? 0.18 : 0.1)));
  const centerArea = (centerRadius * 2 + 1) * (centerRadius * 2 + 1);
  const moduleCenter = (scale - 1) / 2;
  const occViolationWeight = strictScanGate ? 0.35 : 0.55;
  const centerViolationWeight = strictScanGate ? 1.8 : 0.9;
  const scanScoreWeight = strictScanGate ? 12.5 : 8.8;
  const artPenaltyWeight = strictScanGate ? 1.7 : 2.4;
  const edgeBandPenalty = strictScanGate ? 0.44 : 0.14;
  const centerPixelBonus = strictScanGate ? 0.07 : 0.01;
  const occupancies: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(0)
  );
  const centerOcc: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(0)
  );
  const darkMinMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(baseDarkMin)
  );
  const lightMaxMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(baseLightMax)
  );
  const darkCenterMinMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(Math.min(0.64, baseDarkMin + 0.18))
  );
  const lightCenterMaxMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(Math.max(0.36, baseLightMax - 0.18))
  );
  const locked: boolean[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(false)
  );
  const decoupleFinderOptimization =
    config.preserveFinders === false && config.blendPreservations !== true;
  const finderBlendGuidance =
    config.preserveFinders === false && config.blendPreservations === true;

  for (let mr = 0; mr < moduleCount; mr++) {
    for (let mc = 0; mc < moduleCount; mc++) {
      locked[mr][mc] =
        shouldLockModule(mr, mc, moduleCount, version, config) ||
        (decoupleFinderOptimization && isFinderModuleOrSeparator(mr, mc, moduleCount));
    }
  }

  return {
    cctx: {
      qr,
      matrixBits,
      desire,
      moduleCount,
      scale,
      scaledSize,
      version,
      config,
      total,
      centerRadius,
      centerArea,
      moduleCenter,
      baseDarkMin,
      baseLightMax,
      strictScanGate,
      finderBlendGuidance,
      occViolationWeight,
      centerViolationWeight,
      scanScoreWeight,
      artPenaltyWeight,
      edgeBandPenalty,
      centerPixelBonus,
      occupancies,
      centerOcc,
      darkMinMap,
      lightMaxMap,
      darkCenterMinMap,
      lightCenterMaxMap,
      locked,
    },
    maxIters,
  };
}
