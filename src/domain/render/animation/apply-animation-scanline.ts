import { hslToRgbTuple } from '../color/color';
import { tintScanlinePixel } from './shared-patterns._internal';

/**
 * Apply scanline pattern effect to image data
 * Creates a moving scan line across the image
 */
export function applyAnimationScanline(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number
): void {
  const lineWidth = Math.max(4, height * 0.08);
  const lineY = progress * (height + lineWidth * 2) - lineWidth;
  const horizontal = seed % 2 === 0;
  const baseHue = (seed * 17) % 360;
  const scanColor = hslToRgbTuple(baseHue, 80, 50);
  const trailColor = hslToRgbTuple((baseHue + 180) % 360, 60, 60);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] === 0) continue;
      const pos = horizontal ? y : x;
      const linePos = horizontal ? lineY : progress * (width + lineWidth * 2) - lineWidth;
      const distance = Math.abs(pos - linePos);

      if (distance < lineWidth) {
        const intensity = 1 - distance / lineWidth;
        tintScanlinePixel(data, i, intensity, scanColor, trailColor);
      }
    }
  }
}
