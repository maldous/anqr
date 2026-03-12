import type { FinderPattern, FinderPatternResult } from '../../../modules/qr-decoder/types';
import { qrDecoderLog, grayAt, scanRow, verifyVertical, refineFinderPatternCenter } from './locate._internal';

/**
 * Find all finder patterns in the image
 * Returns both the patterns and the threshold used for detection
 */
export function findFinderPatterns(imageData: ImageData): FinderPatternResult {
  const { data: pixels, width, height } = imageData;

  qrDecoderLog.trace('locate: Finding finder patterns', { width, height });

  // Calculate threshold (simple mean). We composite transparency over white
  // so a transparent background is treated as light modules.
  let sum = 0;
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += grayAt(pixels, i);
    count++;
  }
  const threshold = sum / count;

  qrDecoderLog.trace('locate: Calculated threshold', { threshold: threshold.toFixed(1) });

  const candidates: Map<string, FinderPattern> = new Map();

  // Scan every few rows for efficiency
  const step = Math.max(1, Math.floor(height / 100));

  for (let y = step; y < height - step; y += step) {
    const rowResults = scanRow(pixels, width, y, threshold);

    for (const result of rowResults) {
      // Verify vertically
      const vertical = verifyVertical(
        pixels,
        width,
        height,
        result.center,
        y,
        result.moduleSize,
        threshold
      );

      if (vertical.valid) {
        // Refine the center position by sampling the expected finder pattern structure
        const refined = refineFinderPatternCenter(
          pixels,
          width,
          height,
          result.center,
          vertical.center,
          vertical.moduleSize,
          threshold
        );

        // Use grid key to deduplicate nearby patterns
        const gridSize = vertical.moduleSize * 5;
        const gridX = Math.round(refined.x / gridSize);
        const gridY = Math.round(refined.y / gridSize);
        const key = `${gridX},${gridY}`;

        const existing = candidates.get(key);
        if (!existing || existing.count < 10) {
          candidates.set(key, {
            center: { x: refined.x, y: refined.y },
            moduleSize: vertical.moduleSize,
            count: (existing?.count || 0) + 1,
          });
        }
      }
    }
  }

  // Convert to array and filter by count
  const patterns = Array.from(candidates.values())
    .filter((p) => p.count >= 1)
    .sort((a, b) => b.count - a.count);

  qrDecoderLog.trace('locate: Found finder pattern candidates', {
    count: patterns.length,
    patterns: patterns.slice(0, 5).map((p) => ({
      x: p.center.x.toFixed(1),
      y: p.center.y.toFixed(1),
      moduleSize: p.moduleSize.toFixed(2),
      hitCount: p.count,
    })),
  });

  return { patterns, threshold };
}
