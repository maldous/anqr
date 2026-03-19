import { rgbToLumaLinear } from "../color/color";
import type { OverlayToneStats } from "./overlay-tone-stats";

export function computeOverlayToneStats(imageData: ImageData): OverlayToneStats {
  const data = imageData.data;
  const totalPixels = data.length / 4;
  if (totalPixels <= 0) {
    return {
      lumaMean: 0.5,
      lumaStd: 0,
      saturationMean: 0,
      clippedDarkRatio: 0,
      clippedLightRatio: 0,
    };
  }

  const targetSamples = 65536;
  const stride = Math.max(1, Math.floor(Math.sqrt(totalPixels / targetSamples)));
  let sampleCount = 0;
  let sumLuma = 0;
  let sumLumaSq = 0;
  let sumSat = 0;
  let clippedDark = 0;
  let clippedLight = 0;

  const pixelStride = stride * 4;
  for (let i = 0; i < data.length; i += pixelStride) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const maxCh = Math.max(r, g, b);
    const minCh = Math.min(r, g, b);
    const sat = maxCh <= 0 ? 0 : (maxCh - minCh) / maxCh;
    const luma = rgbToLumaLinear(r, g, b);
    sumLuma += luma;
    sumLumaSq += luma * luma;
    sumSat += sat;
    if (luma <= 0.08) clippedDark++;
    if (luma >= 0.92) clippedLight++;
    sampleCount++;
  }

  if (sampleCount <= 0) {
    return {
      lumaMean: 0.5,
      lumaStd: 0,
      saturationMean: 0,
      clippedDarkRatio: 0,
      clippedLightRatio: 0,
    };
  }

  const lumaMean = sumLuma / sampleCount;
  const lumaStd = Math.sqrt(Math.max(0, sumLumaSq / sampleCount - lumaMean * lumaMean));

  return {
    lumaMean,
    lumaStd,
    saturationMean: sumSat / sampleCount,
    clippedDarkRatio: clippedDark / sampleCount,
    clippedLightRatio: clippedLight / sampleCount,
  };
}
