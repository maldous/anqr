import type { BitPixelMapping } from "./bit-mapping.types";

/**
 * Build a map from pixel index to the bit that affects it
 */
export function buildPixelToBitMap(mappings: BitPixelMapping[]): Map<number, BitPixelMapping> {
  const map = new Map<number, BitPixelMapping>();
  for (const m of mappings) {
    map.set(m.pixelIndex, m);
  }
  return map;
}
