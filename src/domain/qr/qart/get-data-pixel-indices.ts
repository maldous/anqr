import { dataPixelIndicesCache, updateLruCache, DATA_PIXEL_INDICES_CACHE_LIMIT, isStructural } from './bit-mapping._internal';
import { getModuleCount } from './get-module-count';
import { pixelToIndex } from './pixel-to-index';

/**
 * Get all data pixel indices (non-structural modules)
 */
export function getDataPixelIndices(version: number): number[] {
  const cached = dataPixelIndicesCache.get(version);
  if (cached) {
    updateLruCache(dataPixelIndicesCache, version, cached, DATA_PIXEL_INDICES_CACHE_LIMIT);
    return cached;
  }

  const moduleCount = getModuleCount(version);
  const indices: number[] = [];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!isStructural(row, col, moduleCount, version)) {
        indices.push(pixelToIndex(row, col, moduleCount));
      }
    }
  }

  updateLruCache(dataPixelIndicesCache, version, indices, DATA_PIXEL_INDICES_CACHE_LIMIT);
  return indices;
}
