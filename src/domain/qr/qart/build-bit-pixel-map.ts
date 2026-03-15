import { getMaskFunction } from '../spec/masks';
import type { ECCLevel, BitPixelMapping } from './bit-mapping.types';
import { bitPixelMapCache } from './bit-pixel-map-cache';
import { BIT_PIXEL_MAP_CACHE_LIMIT } from './bit-pixel-map-cache-limit';
import { buildInterleavingMap } from './build-interleaving-map';
import { log } from './log';
import { recordDataBitMapping } from './record-data-bit-mapping';
import { updateLruCache } from './update-lru-cache';
import { getModuleCount } from './get-module-count';
import { getRSBlockInfo } from './get-rs-block-info';
import { getTotalCodewords } from './get-total-codewords';

/**
 * Build the complete bit-to-pixel mapping by simulating the zigzag traversal
 *
 * This replicates the exact traversal order from encoder.ts:mapData
 * The traversal:
 * - Starts from bottom-right, moves in 2-column pairs
 * - Alternates between moving up and down
 * - Skips column 6 (timing pattern)
 * - Only places bits in non-structural modules
 *
 * @param version QR version (1-40)
 * @param ecc Error correction level
 * @param maskPattern Mask pattern (0-7) - needed to know final pixel value
 */
export function buildBitPixelMap(
  version: number,
  ecc: ECCLevel,
  maskPattern: number
): BitPixelMapping[] {
  const cacheKey = `${version}:${ecc}:${maskPattern}`;
  const cached = bitPixelMapCache.get(cacheKey);
  if (cached) {
    updateLruCache(bitPixelMapCache, cacheKey, cached, BIT_PIXEL_MAP_CACHE_LIMIT);
    return cached;
  }

  const moduleCount = getModuleCount(version);
  const rsBlockInfo = getRSBlockInfo(version, ecc);
  const totalCodewords = getTotalCodewords(version, ecc);
  const _maskFunc = getMaskFunction(maskPattern);

  // Build interleaving map: which byte index in final stream maps to which block/position
  const interleavingMap = buildInterleavingMap(rsBlockInfo);

  // Now simulate the zigzag traversal
  const mappings: BitPixelMapping[] = [];
  const bitState = { bitIndex: 7, byteIndex: 0 };
  let inc = -1; // -1 = moving up, +1 = moving down
  let row = moduleCount - 1;

  let col = moduleCount - 1;
  while (col > 0) {
    // Skip column 6 (timing pattern)
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c++) {
        recordDataBitMapping(
          row,
          col - c,
          moduleCount,
          version,
          totalCodewords,
          interleavingMap,
          bitState,
          mappings
        );
      }

      row += inc;

      if (row < 0 || moduleCount <= row) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
    col -= 2;
  }

  log.debug('Built bit-pixel map', {
    version,
    ecc,
    maskPattern,
    moduleCount,
    totalBits: mappings.length,
    totalCodewords,
  });

  updateLruCache(bitPixelMapCache, cacheKey, mappings, BIT_PIXEL_MAP_CACHE_LIMIT);
  return mappings;
}
