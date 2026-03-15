import type { BitPixelMapping } from './bit-mapping.types';

/**
 * Build a map from global bit index to its mapping
 */
export function buildBitToMappingMap(mappings: BitPixelMapping[]): Map<number, BitPixelMapping> {
  const map = new Map<number, BitPixelMapping>();
  for (const m of mappings) {
    map.set(m.globalBitIndex, m);
  }
  return map;
}
