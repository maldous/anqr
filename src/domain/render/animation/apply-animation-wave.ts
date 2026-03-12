import { hslToRgbTuple } from '../color/color';

/**
 * Apply wave pattern effect to image data
 * Creates horizontal color waves across the image
 */
export function applyAnimationWave(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const waveFrequency = 3 + (seed % 5);
  const baseHue = (seed * 23) % 360;

  for (let y = 0; y < height; y++) {
    const wavePhase = Math.sin((y / height) * waveFrequency * Math.PI * 2 + progress * Math.PI * 2);
    const waveIntensity = (wavePhase + 1) / 2;
    const rowHue = (((baseHue + wavePhase * 30) % 360) + 360) % 360;
    const waveColor = hslToRgbTuple(rowHue, 70, 50);

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const brightness = (r + g + b) / 3;
      const isDark = brightness < 128;

      if (isDark) {
        const tintAmount = waveIntensity * 0.6;
        data[i] = Math.min(255, r + waveColor[0] * tintAmount);
        data[i + 1] = Math.min(255, g + waveColor[1] * tintAmount);
        data[i + 2] = Math.min(255, b + waveColor[2] * tintAmount);
      } else {
        const darkenAmount = waveIntensity * 0.15;
        data[i] = Math.round(r * (1 - darkenAmount));
        data[i + 1] = Math.round(g * (1 - darkenAmount));
        data[i + 2] = Math.round(b * (1 - darkenAmount));
      }
    }
  }
}
