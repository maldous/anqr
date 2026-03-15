import { clampToByte } from './clamp-to-byte';
import { forEachOpaquePixel } from './for-each-opaque-pixel';
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

    forEachOpaquePixel(
      data.subarray(y * width * 4, (y + 1) * width * 4),
      (index, r, g, b, isDark) => {
        const i = y * width * 4 + index;
        if (isDark) {
          const tintAmount = waveIntensity * 0.6;
          data[i] = clampToByte(r + waveColor[0] * tintAmount);
          data[i + 1] = clampToByte(g + waveColor[1] * tintAmount);
          data[i + 2] = clampToByte(b + waveColor[2] * tintAmount);
        } else {
          const darkenAmount = waveIntensity * 0.15;
          data[i] = clampToByte(r * (1 - darkenAmount));
          data[i + 1] = clampToByte(g * (1 - darkenAmount));
          data[i + 2] = clampToByte(b * (1 - darkenAmount));
        }
      }
    );
  }
}
