import { bitPixelMapCache } from "./bit-pixel-map-cache";
import { dataPixelIndicesCache } from "./data-pixel-indices-cache";

export function clearBitMappingCache(): void {
  bitPixelMapCache.clear();
  dataPixelIndicesCache.clear();
}
