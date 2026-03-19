import { rgbToLumaLinear } from "../color/color";
import { clamp01 } from "../primitives/math";
import { clampByte } from "./clamp-byte";
import type { OverlayToneStats } from "./overlay-tone-stats";

export function applyAdaptiveColorNormalization(
  imageData: ImageData,
  stats: OverlayToneStats,
  strength: number,
): ImageData {
  const normalizedStrength = clamp01(strength);
  if (normalizedStrength <= 0.001) return imageData;

  const data = imageData.data;
  const meanLuma = stats.lumaMean;
  const contrastScale = 1 - normalizedStrength * 0.3;
  const satScale = 1 - normalizedStrength * 0.22;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const luma = rgbToLumaLinear(r, g, b);
    const gray = (r + g + b) / 3;
    let rAdj = gray + (r - gray) * satScale;
    let gAdj = gray + (g - gray) * satScale;
    let bAdj = gray + (b - gray) * satScale;

    let targetLuma = meanLuma + (luma - meanLuma) * contrastScale;
    if (targetLuma > 0.5) {
      targetLuma = 0.5 + (targetLuma - 0.5) * (1 - normalizedStrength * 0.18);
    } else {
      targetLuma = 0.5 - (0.5 - targetLuma) * (1 - normalizedStrength * 0.14);
    }

    const adjustedLuma = rgbToLumaLinear(clampByte(rAdj), clampByte(gAdj), clampByte(bAdj));
    const delta = (targetLuma - adjustedLuma) * 255;
    rAdj += delta;
    gAdj += delta;
    bAdj += delta;

    data[i] = clampByte(rAdj);
    data[i + 1] = clampByte(gAdj);
    data[i + 2] = clampByte(bAdj);
  }

  return imageData;
}
