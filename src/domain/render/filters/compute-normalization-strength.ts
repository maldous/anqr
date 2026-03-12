import { clamp01 } from './clamp01';
import type { OverlayToneStats } from './overlay-tone-stats';

export function computeNormalizationStrength(
  stats: OverlayToneStats,
  overlayIntensity: number
): number {
  const clipRisk = clamp01((stats.clippedDarkRatio + stats.clippedLightRatio - 0.12) / 0.28);
  const contrastRisk = clamp01((stats.lumaStd - 0.2) / 0.18);
  const saturationRisk = clamp01((stats.saturationMean - 0.24) / 0.32);
  const intensityRisk = clamp01((overlayIntensity - 0.45) / 0.45);
  return clamp01(
    contrastRisk * 0.38 + saturationRisk * 0.28 + clipRisk * 0.24 + intensityRisk * 0.2
  );
}
