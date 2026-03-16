import { grayAt } from "./gray-at";
import { DARK_CORE_MODULES } from "./dark-core-modules";
import { WHITE_RING_MODULES } from "./white-ring-modules";

export function sampleFinderContrast(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  testX: number,
  testY: number,
  moduleSize: number,
) {
  const finderOriginX = testX - 3.5 * moduleSize;
  const finderOriginY = testY - 3.5 * moduleSize;

  let darkSum = 0;
  let darkCount = 0;
  for (const [col, row] of DARK_CORE_MODULES) {
    const px = Math.round(finderOriginX + (col + 0.5) * moduleSize);
    const py = Math.round(finderOriginY + (row + 0.5) * moduleSize);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      darkSum += grayAt(pixels, (py * width + px) * 4);
      darkCount++;
    }
  }

  let lightSum = 0;
  let lightCount = 0;
  for (const [col, row] of WHITE_RING_MODULES) {
    const px = Math.round(finderOriginX + (col + 0.5) * moduleSize);
    const py = Math.round(finderOriginY + (row + 0.5) * moduleSize);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      lightSum += grayAt(pixels, (py * width + px) * 4);
      lightCount++;
    }
  }

  const avgDark = darkCount > 0 ? darkSum / darkCount : 127;
  const avgLight = lightCount > 0 ? lightSum / lightCount : 127;
  return { avgDark, avgLight, contrast: avgLight - avgDark, darkCount, lightCount };
}
