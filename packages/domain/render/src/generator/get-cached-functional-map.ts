import { buildFunctionalMap } from "./build-functional-map";
import { getFunctionalMapCache, setFunctionalMapCache } from "./functional-map-cache";

export function getCachedFunctionalMap(moduleCount: number, version: number): Uint8Array {
  const cache = getFunctionalMapCache();
  if (
    cache.cachedMap !== null &&
    moduleCount === cache.cachedModuleCount &&
    version === cache.cachedVersion
  ) {
    return cache.cachedMap;
  }
  const map = buildFunctionalMap(moduleCount, version);
  setFunctionalMapCache(moduleCount, version, map);
  return map;
}
