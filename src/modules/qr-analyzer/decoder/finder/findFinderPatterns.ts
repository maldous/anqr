import {FinderPattern, best, for, imageData, of, patterns, s, t, threshold, x} from '../shared';
import { buildLumaBuffer } from '../luma/buildLumaBuffer';
import { calculateAverageBrightness } from '../luma/calculateAverageBrightness';
import { createAdaptiveBinaryFromLuma } from '../binarize/createAdaptiveBinaryFromLuma';
import { createBinaryFromLuma } from '../binarize/createBinaryFromLuma';
import { findFinderPatternsWithBinary } from '../finder/findFinderPatternsWithBinary';
import { findFinderPatternsWithTemplate } from '../finder/findFinderPatternsWithTemplate';
import { otsuThresholdFromLuma } from '../luma/otsuThresholdFromLuma';
/**
 * Find all finder patterns in an image
 * Tries multiple thresholding strategies for robustness
 */
export function findFinderPatterns(imageData: ImageData): FinderPattern[] {
  const { width, height } = imageData;

  debugLog(`findFinderPatterns: START image ${width}x${height}`);

  // Build luma once (many threshold attempts)
  const luma = buildLumaBuffer(imageData);

  // Prefer Otsu, but keep multiple fallbacks for real-world photos
  const otsu = otsuThresholdFromLuma(luma);
  const avgBrightness = calculateAverageBrightness(imageData, luma);

  debugLog(`findFinderPatterns: Otsu=${otsu}, avgBrightness=${avgBrightness.toFixed(1)}`);

  // Build list of thresholds to try (deduped later)
  const thresholds: number[] = [otsu];

  // Add average brightness if significantly different from Otsu
  if (Math.abs(otsu - avgBrightness) > 20) {
    thresholds.push(Math.round(avgBrightness));
  }

  // Add variations around Otsu
  thresholds.push(
    Math.max(0, otsu - 20),
    Math.max(0, otsu - 10),
    Math.min(255, otsu + 10),
    Math.min(255, otsu + 20)
  );

  // Add generic fallback
  thresholds.push(128);

  // Deduplicate + clamp
  const uniqueThresholds = Array.from(
    new Set(thresholds.map((t) => Math.round(Math.max(0, Math.min(255, t)))))
  );

  const s = ACTIVE_STATS;
  s?.gauge('thresholds.count', uniqueThresholds.length);
  s?.gauge('binarization.otsu', otsu);
  s?.gauge('binarization.avgBrightness', avgBrightness);

  debugLog(`findFinderPatterns: trying thresholds=[${uniqueThresholds.join(',')}]`);

  let bestPatterns: FinderPattern[] = [];

  // Try binary run-length based detection
  for (const threshold of uniqueThresholds) {
    s?.inc('thresholds.tried', 1);
    debugLog(`findFinderPatterns: trying threshold=${threshold}`);

    const binary = createBinaryFromLuma(luma, threshold);
    const patterns = findFinderPatternsWithBinary(binary, width, height);

    debugLog(`findFinderPatterns: threshold=${threshold} found ${patterns.length} patterns`);

    if (patterns.length >= 3) {
      s?.gauge('threshold.selected', threshold);
      s?.gauge('finders.count', patterns.length);
      s?.gauge('binarization.fgRatio', estimateForegroundRatio(binary));
      debugLog(`findFinderPatterns: SUCCESS threshold=${threshold}`);
      return patterns;
    }

    if (patterns.length > bestPatterns.length) {
      bestPatterns = patterns;
    }
  }

  // Fallback: template matching (slower, but can recover when run-length fails)
  if (bestPatterns.length < 3) {
    debugLog(`findFinderPatterns: trying template matching fallback`);

    const templateThresholds = [otsu, Math.round(avgBrightness), 128];
    for (const threshold of templateThresholds) {
      debugLog(`findFinderPatterns: template threshold=${threshold}`);
      const templatePatterns = findFinderPatternsWithTemplate(imageData, luma, threshold);

      debugLog(`findFinderPatterns: template found ${templatePatterns.length} patterns`);

      if (templatePatterns.length >= 3) {
        s?.gauge('threshold.selected', threshold);
        s?.gauge('finders.count', templatePatterns.length);
        s?.gauge('binarization.fgRatio', estimateForegroundRatio(createBinaryFromLuma(luma, threshold)));
        debugLog(`findFinderPatterns: SUCCESS with template threshold=${threshold}`);
        return templatePatterns;
      }

      if (templatePatterns.length > bestPatterns.length) {
        bestPatterns = templatePatterns;
      }
    }
  }

  // Fallback: adaptive threshold (Bradley-Roth) for uneven lighting
  if (bestPatterns.length < 3) {
    const win = (Math.max(15, Math.floor(Math.min(width, height) / 8)) | 1); // ensure odd
    const adaptive = createAdaptiveBinaryFromLuma(luma, width, height, win, 0.15);

    if (adaptive) {
      const adaptivePatterns = findFinderPatternsWithBinary(adaptive, width, height);
      debugLog(`findFinderPatterns: adaptive(win=${win}) found ${adaptivePatterns.length} patterns`);

      if (adaptivePatterns.length >= 3) {
        debugLog(`findFinderPatterns: SUCCESS with adaptive threshold`);
        return adaptivePatterns;
      }

      if (adaptivePatterns.length > bestPatterns.length) {
        bestPatterns = adaptivePatterns;
      }
    } else {
      debugLog(`findFinderPatterns: adaptive threshold skipped (image too large)`);
    }
  }

  debugLog(`findFinderPatterns: FAILED - returning best=${bestPatterns.length} patterns`);
  return bestPatterns;
}

