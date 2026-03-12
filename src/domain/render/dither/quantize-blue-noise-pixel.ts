import type { ColorMode } from '../../../modules/dither-algorithms/types';
import { rgbToGray } from '../../../modules/dither-algorithms/utils';
import type { BlueNoisePixelResult } from './blue-noise-pixel-result';

export function quantizeBlueNoisePixel(
  r: number,
  g: number,
  b: number,
  threshold: number,
  strengthFactor: number,
  colorMode: ColorMode,
  levels: number
): BlueNoisePixelResult {
  if (colorMode === 'bw') {
    const gray = rgbToGray(r, g, b);
    const adjustedThreshold = 0.5 + (threshold - 0.5) * strengthFactor;
    const isDark = gray < adjustedThreshold;
    return { isDark, color: isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 } };
  } else if (colorMode === 'grayscale') {
    const gray = rgbToGray(r, g, b);
    const scaled = gray * (levels - 1);
    const low = Math.floor(scaled);
    const high = Math.min(low + 1, levels - 1);
    const frac = scaled - low;
    const t = 0.5 + (threshold - 0.5) * strengthFactor;
    const newVal = (frac > t ? high : low) / (levels - 1);
    const grayByte = Math.round(newVal * 255);
    return { isDark: newVal < 0.5, color: { r: grayByte, g: grayByte, b: grayByte } };
  }
  const quantize = (val: number, noiseOffset: number): number => {
    const t = (threshold + noiseOffset) % 1;
    const adjustedT = 0.5 + (t - 0.5) * strengthFactor;
    const scaled = val * (levels - 1);
    const low = Math.floor(scaled);
    const high = Math.min(low + 1, levels - 1);
    const frac = scaled - low;
    return (frac > adjustedT ? high : low) / (levels - 1);
  };
  const newR = quantize(r, 0);
  const newG = quantize(g, 0.33);
  const newB = quantize(b, 0.67);
  const brightness = rgbToGray(newR, newG, newB);
  return {
    isDark: brightness < 0.5,
    color: { r: Math.round(newR * 255), g: Math.round(newG * 255), b: Math.round(newB * 255) },
  };
}
