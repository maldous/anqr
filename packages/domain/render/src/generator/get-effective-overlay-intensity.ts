import type { QRGeneratorConfig } from "@/modules/qr-generator/types";
import { DEFAULT_ECC_LIMITS } from "./default-ecc-limits.const";
import { curveIntensity } from "./curve-overlay-intensity";

export function getEffectiveIntensity(config: QRGeneratorConfig): {
  effectiveIntensity: number;
  effectiveConfig: QRGeneratorConfig;
} {
  const rawPct = config.overlayIntensity ?? 100;
  const eccLimits = config.maxOverlayIntensityByEcc ?? DEFAULT_ECC_LIMITS;
  const maxIntensityPct = eccLimits[config.errorCorrection] ?? 100;
  const cappedPct = Math.min(rawPct, maxIntensityPct);
  const effectiveIntensity = curveIntensity(cappedPct);

  return {
    effectiveIntensity,
    effectiveConfig: { ...config, overlayIntensity: cappedPct },
  };
}
