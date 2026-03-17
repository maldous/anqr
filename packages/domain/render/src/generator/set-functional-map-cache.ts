import { functionalMapCacheState } from "./functional-map-cache-state";

export function setFunctionalMapCache(
  moduleCount: number,
  version: number,
  map: Uint8Array | null,
): void {
  functionalMapCacheState.cachedModuleCount = moduleCount;
  functionalMapCacheState.cachedVersion = version;
  functionalMapCacheState.cachedMap = map;
}
