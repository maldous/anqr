/**
 * Pattern Helper Functions
 * Delegates to qr-spec module (canonical source for QR domain knowledge)
 * Adds QR-generator specific caching layer for performance
 */

import { getAlignmentPatternCenters } from "@/modules/qr-spec";
import { alignmentCache } from "@/modules/qr-generator/cache";

// Re-export from qr-spec (canonical source)
export { isFormatInfo, isVersionInfo } from "@/modules/qr-spec";

/**
 * Cached version of getAlignmentPositions that returns {row, col} objects
 * Note: This has a different return type than qr-spec's getAlignmentPositions
 */
export function getAlignmentPositionsCached(
  version: number,
  moduleCount: number,
): Array<{ row: number; col: number }> {
  if (version < 2) return [];

  // Check cache first (called multiple times per render)
  const cacheKey = `${version}-${moduleCount}`;
  const cached = alignmentCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Get positions from qr-spec (requires both version and moduleCount)
  const positions = getAlignmentPatternCenters(version, moduleCount);

  // Cache the result
  alignmentCache.set(cacheKey, positions);
  return positions;
}
