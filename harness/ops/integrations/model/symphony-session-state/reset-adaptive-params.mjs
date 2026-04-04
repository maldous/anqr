// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:558

import { DEFAULT_ADAPTIVE_PARAMS } from "./default-adaptive-params.mjs";
import { paramsCache, setParamsCache } from "./params-cache.mjs";
import { saveAdaptiveParams } from "./save-adaptive-params.mjs";
import { logInfo } from "./logger.mjs";

export function resetAdaptiveParams() {
  setParamsCache(structuredClone(DEFAULT_ADAPTIVE_PARAMS));
  saveAdaptiveParams(paramsCache);
  logInfo(`[session-state] 🔄 Reset adaptive parameters to defaults`);
}
