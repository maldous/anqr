import {best, bit, c, cx, dark, for, i, idx, imageData, isDark, px, py, score, threshold} from '../shared';
import { getAlignmentPatternExpected } from '../alignment/getAlignmentPatternExpected';
import { samplePixelGray } from '../luma/samplePixelGray';
/**
 * Scores an alignment pattern centered at (cx, cy) in image space using an approximate moduleSizePx.
 * Returns best score across both polarities (normal/inverted).
 */
export function scoreAlignmentPatternAtPixel(
  imageData: ImageData,
  cx: number,
  cy: number,
  moduleSizePx: number
): number {
  // Sample the 5x5 alignment pattern template and compute a local threshold from the
  // expected-dark / expected-light samples. Avoid per-sample object allocations.
  const gVals: number[] = new Array(25);
  let expMask = 0; // bit i = expectedDark for sample i

  let darkSum = 0;
  let lightSum = 0;
  let darkN = 0;
  let lightN = 0;

  let idx = 0;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const localRow = r + 2;
      const localCol = c + 2;
      const expDark = getAlignmentPatternExpected(localRow, localCol);

      const px = cx + c * moduleSizePx;
      const py = cy + r * moduleSizePx;
      const g = samplePixelGray(imageData, px, py);

      gVals[idx] = g;
      if (expDark) {
        expMask |= (1 << idx);
        darkSum += g;
        darkN++;
      } else {
        lightSum += g;
        lightN++;
      }
      idx++;
    }
  }

  if (darkN === 0 || lightN === 0) return 0;

  const darkMean = darkSum / darkN;
  const lightMean = lightSum / lightN;
  const thr = (darkMean + lightMean) * 0.5;

  const contrast = Math.abs(lightMean - darkMean);
  const minContrast = moduleSizePx < 3 ? 8 : 14;

  let scoreNormal = 0;
  let scoreInverted = 0;

  for (let i = 0; i < 25; i++) {
    const expDark = ((expMask >>> i) & 1) !== 0;
    const isDark = gVals[i] < thr;

    if (isDark === expDark) scoreNormal++;
    if (!isDark === expDark) scoreInverted++;
  }

  let best = Math.max(scoreNormal, scoreInverted);

  // Suppress false positives in low-contrast regions
  if (contrast < minContrast) {
    best = Math.round(best * (contrast / Math.max(1e-6, minContrast)));
  }

  return best;
}

