// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:548

import { loadAdaptiveParams } from "./load-adaptive-params.mjs";
import { paramsCache, setParamsCache } from "./params-cache.mjs";

export function getAdaptiveParams() {
  if (!paramsCache) {
    setParamsCache(loadAdaptiveParams());
  }
  return paramsCache;
}
