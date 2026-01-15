import {bottom, c0, col, dark, for, imageData, left, of, patterns, pt, r0, right, row, t, threshold, top, transform, x, y} from '../shared';
import { getFinderPatternExpected } from '../finder/getFinderPatternExpected';
import { median } from '../location/median';
import { samplePixelGray } from '../luma/samplePixelGray';
/**
 * Estimate a threshold from the three finder patterns, which tends to be more reliable than a global threshold
 * on gradients / shadows. Returns null if insufficient samples.
 */
export function estimateThresholdFromFinderPatterns(
  imageData: ImageData,
  transform: (col: number, row: number) => Point,
  moduleCount: number
): number | null {
  const finderOrigins = [
    { r0: 0, c0: 0 }, // top-left
    { r0: 0, c0: moduleCount - 7 }, // top-right
    { r0: moduleCount - 7, c0: 0 }, // bottom-left
  ];

  const dark: number[] = [];
  const light: number[] = [];

  for (const { r0, c0 } of finderOrigins) {
    for (let lr = 0; lr < 7; lr++) {
      for (let lc = 0; lc < 7; lc++) {
        const expectedDark = getFinderPatternExpected(lr, lc);
        const pt = transform(c0 + lc, r0 + lr);
        const g = samplePixelGray(imageData, pt.x, pt.y);
        if (expectedDark) dark.push(g);
        else light.push(g);
      }
    }
  }

  if (dark.length < 30 || light.length < 30) return null;

  const md = median(dark);
  const ml = median(light);
  const t = Math.round((md + ml) / 2);

  // Clamp away from extremes
  if (!Number.isFinite(t) || t < 10 || t > 245) return null;
  return t;
}

