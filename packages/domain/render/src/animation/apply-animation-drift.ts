import { hslToRgbTuple } from "../color/color";

/**
 * Apply drift pattern effect to image data
 * Creates flowing color gradients
 */
export function applyAnimationDrift(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number,
): void {
  const scale = 0.015 + (seed % 10) * 0.003;
  const timeOffset = progress * Math.PI * 2;
  const baseHue = (seed * 41 + progress * 60) % 360;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const isDark = brightness < 128;

      const drift = Math.sin(x * scale + timeOffset) * Math.cos(y * scale + timeOffset);
      const driftIntensity = (drift + 1) / 2;
      const driftHue = (((baseHue + drift * 40) % 360) + 360) % 360;
      const driftColor = hslToRgbTuple(driftHue, 60, 50);

      if (isDark) {
        const tintAmount = driftIntensity * 0.5;
        data[i] = Math.min(255, r + driftColor[0] * tintAmount);
        data[i + 1] = Math.min(255, g + driftColor[1] * tintAmount);
        data[i + 2] = Math.min(255, b + driftColor[2] * tintAmount);
      } else {
        const darkenAmount = driftIntensity * 0.1;
        data[i] = Math.round(r * (1 - darkenAmount));
        data[i + 1] = Math.round(g * (1 - darkenAmount));
        data[i + 2] = Math.round(b * (1 - darkenAmount));
      }
    }
  }
}
