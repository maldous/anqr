import { hslToRgbTuple } from '../color/color';

/**
 * Apply color cycle pattern effect to image data
 * Cycles hue across the animation
 */
export function applyAnimationColorCycle(
  data: Uint8ClampedArray,
  progress: number,
  seed: number
): void {
  const baseHue = (progress * 360 + seed) % 360;
  const tintColor = hslToRgbTuple(baseHue, 80, 50);
  const complementHue = (baseHue + 180) % 360;
  const complementColor = hslToRgbTuple(complementHue, 30, 70);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    if (isDark) {
      const tintAmount = 0.7;
      data[i] = Math.min(255, r + tintColor[0] * tintAmount);
      data[i + 1] = Math.min(255, g + tintColor[1] * tintAmount);
      data[i + 2] = Math.min(255, b + tintColor[2] * tintAmount);
    } else {
      const tintAmount = 0.15;
      data[i] = Math.max(0, Math.round(r - (255 - complementColor[0]) * tintAmount));
      data[i + 1] = Math.max(0, Math.round(g - (255 - complementColor[1]) * tintAmount));
      data[i + 2] = Math.max(0, Math.round(b - (255 - complementColor[2]) * tintAmount));
    }
  }
}
