import { hslToRgbTuple } from "../color/color";
import { createSeededRandom } from "../primitives/math";

/**
 * Apply shimmer pattern effect to image data
 * Creates random sparkle effects
 */
export function applyAnimationShimmer(
  data: Uint8ClampedArray,
  progress: number,
  width: number,
  height: number,
  seed: number,
): void {
  const random = createSeededRandom(seed + Math.floor(progress * 1000));
  const spotCount = Math.floor(width * height * 0.02);
  const baseHue = (seed * 13 + progress * 100) % 360;

  for (let s = 0; s < spotCount; s++) {
    const x = Math.floor(random() * width);
    const y = Math.floor(random() * height);
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue;

    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    const spotHue = (baseHue + random() * 60) % 360;
    const sparkleColor = hslToRgbTuple(spotHue, 90, isDark ? 60 : 40);
    const intensity = 0.5 + random() * 0.5;

    if (isDark) {
      data[i] = Math.min(255, r + sparkleColor[0] * intensity);
      data[i + 1] = Math.min(255, g + sparkleColor[1] * intensity);
      data[i + 2] = Math.min(255, b + sparkleColor[2] * intensity);
    } else {
      data[i] = Math.max(0, r - (255 - sparkleColor[0]) * intensity * 0.3);
      data[i + 1] = Math.max(0, g - (255 - sparkleColor[1]) * intensity * 0.3);
      data[i + 2] = Math.max(0, b - (255 - sparkleColor[2]) * intensity * 0.3);
    }
  }
}
