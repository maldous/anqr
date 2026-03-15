import { clamp01 } from './clamp01';

export function computeBWFirstShade(
  overlayBrightness: number,
  textureAmount: number,
  noiseVariation: number,
  qrIsDark: boolean
): number {
  if (qrIsDark) {
    const darkRange = 100;
    let normalizedShade = (1 - overlayBrightness) * textureAmount;
    normalizedShade = clamp01(normalizedShade + noiseVariation * textureAmount);
    return Math.floor((1 - normalizedShade) * darkRange);
  }
  const lightMin = 155;
  const lightRange = 100;
  let normalizedShade = overlayBrightness * textureAmount;
  normalizedShade = clamp01(normalizedShade + noiseVariation * textureAmount);
  if (textureAmount === 0) return 255;
  return lightMin + Math.floor(normalizedShade * lightRange);
}
