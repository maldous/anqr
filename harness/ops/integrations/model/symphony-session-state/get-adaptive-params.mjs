import { loadAdaptiveParams } from "./load-adaptive-params.mjs";
import { paramsCache, setParamsCache } from "./params-cache.mjs";

export function getAdaptiveParams() {
  if (!paramsCache) {
    setParamsCache(loadAdaptiveParams());
  }
  return paramsCache;
}
