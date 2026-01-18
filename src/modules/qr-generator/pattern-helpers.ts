/**
 * Pattern Helper Functions
 * Delegates to qr-spec module (canonical source for QR domain knowledge)
 * Adds QR-generator specific caching layer for performance
 */

import {
  isFormatInfo as isFormatInfoSpec,
  isVersionInfo as isVersionInfoSpec,
  getAlignmentPatternCenters,
} from '../qr-spec';
import { alignmentCache } from './cache';

// Re-export from qr-spec (canonical source)
export const isFormatInfo = isFormatInfoSpec;
export const isVersionInfo = isVersionInfoSpec;

/**
 * Get alignment pattern positions with caching
 * Uses qr-spec's getAlignmentPatternCenters but adds caching layer for performance
 * 
 * Note: Returns {row, col}[] objects (different from qr-spec's getAlignmentPositions which returns number[])
 * This is a cached wrapper around getAlignmentPatternCenters, not a duplicate of getAlignmentPositions
 */
// Import getAlignmentPositions from qr-spec and cache results
import { getAlignmentPositions } from '../qr-spec';

/**
 * Cached version of getAlignmentPositions that returns {row, col} objects
 * Note: This has a different return type than qr-spec's getAlignmentPositions
 */
export function getAlignmentPositionsCached(
  version: number,
  moduleCount: number
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
