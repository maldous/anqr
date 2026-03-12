import { bitPixelMapCache, dataPixelIndicesCache } from './bit-mapping._internal';

export function clearBitMappingCache(): void {
  bitPixelMapCache.clear();
  dataPixelIndicesCache.clear();
}
