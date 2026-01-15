import {for, hist, i, of, t, threshold, total, variance} from '../shared';
import { quantileFromHistogram } from '../luma/quantileFromHistogram';
import { quantileFromHistogramReverse } from '../luma/quantileFromHistogramReverse';
/**
 * Proper Otsu threshold implementation.
 * - Uses normalized between-class variance.
 * - Averages all thresholds that achieve the maximum variance (important for
 *   perfectly bimodal distributions).
 * - Adds low-contrast + edge-case fallbacks that are common in QR imagery.
 */
export function otsuThresholdFromHistogram(hist: number[], total: number): number {
  qrLogLazy('debug', () => `otsuThresholdFromHistogram: total=${total}`);
  if (total <= 0) {
    qrLogLazy('debug', () => `otsuThresholdFromHistogram: total<=0, returning 128`);
    return 128;
  }

  // Robust bounds to ignore tiny tails (e.g., compression artifacts)
  const minGray = quantileFromHistogram(hist, total, 0.005);
  const maxGray = quantileFromHistogramReverse(hist, total, 0.005);
  qrLogLazy('debug', () => `otsuThresholdFromHistogram: minGray=${minGray}, maxGray=${maxGray}, dynamicRange=${maxGray - minGray}`);

  if (maxGray <= minGray) return 128;

  const dynamicRange = maxGray - minGray;
  if (dynamicRange < 24) {
    // Very low contrast: Otsu is unstable; use midpoint of observed range
    return Math.round((minGray + maxGray) / 2);
  }

  let sumAll = 0;
  for (let i = minGray; i <= maxGray; i++) sumAll += i * hist[i];

  let sumB = 0;
  let wB = 0;

  let maxBetween = -1;
  let threshold1 = minGray;
  let threshold2 = minGray;

  for (let t = minGray; t <= maxGray; t++) {
    const h = hist[t];
    if (h === 0) continue;

    wB += h;
    sumB += t * h;

    const wF = total - wB;
    if (wB === 0 || wF === 0) continue;

    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;

    const pB = wB / total;
    const pF = wF / total;

    const between = pB * pF * (mB - mF) * (mB - mF);

    if (between > maxBetween + 1e-12) {
      maxBetween = between;
      threshold1 = t;
      threshold2 = t;
    } else if (Math.abs(between - maxBetween) <= 1e-12) {
      threshold2 = t;
    }
  }

  let threshold = Math.round((threshold1 + threshold2) / 2);
  qrLogLazy('debug', () => `otsuThresholdFromHistogram: initial threshold=${threshold} (from range ${threshold1}-${threshold2})`);

  // If Otsu lands on an edge, fall back to a valley or midpoint.
  if (threshold <= minGray + 1 || threshold >= maxGray - 1) {
    qrLogLazy('debug', () => `otsuThresholdFromHistogram: threshold on edge, trying valley fallback`);
    const mid = Math.floor((minGray + maxGray) / 2);

    // Find dominant peaks on each side, then pick the lowest bin between them.
    let leftPeak = minGray;
    let rightPeak = maxGray;
    for (let i = minGray; i <= mid; i++) if (hist[i] > hist[leftPeak]) leftPeak = i;
    for (let i = mid + 1; i <= maxGray; i++) if (hist[i] > hist[rightPeak]) rightPeak = i;

    if (leftPeak + 1 < rightPeak) {
      // FIX: Search for valley BETWEEN the peaks, not including them.
      // Initialize to midpoint between peaks, then find the true minimum.
      let valley = Math.floor((leftPeak + rightPeak) / 2);
      let minCount = hist[valley];
      for (let i = leftPeak + 1; i < rightPeak; i++) {
        if (hist[i] < minCount) {
          minCount = hist[i];
          valley = i;
        }
      }
      threshold = valley;
    } else {
      threshold = Math.round((minGray + maxGray) / 2);
    }
  }

  const finalThreshold = Math.max(0, Math.min(255, threshold));
  qrLogLazy('debug', () => `otsuThresholdFromHistogram: FINAL threshold=${finalThreshold}`);
  return finalThreshold;
}

