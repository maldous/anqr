import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";
import type { SubpixelToneParams } from "../scaled-render-types";
import { curveIntensity } from "../pixel-matrix-utils";

export function computeSubpixelToneParams(config: QRGeneratorConfig): SubpixelToneParams {
  const strength = curveIntensity(config.overlayIntensity ?? 100);
  return {
    subpixelDarkTargetLuma: 0.2 - strength * 0.1,
    subpixelLightTargetLuma: 0.8 + strength * 0.15,
    subpixelDarkChroma: 1.15 + strength * 0.35,
    subpixelLightChroma: 0.92 - strength * 0.24,
  };
}
