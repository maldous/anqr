// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:102

import { readFileSync, existsSync } from "node:fs";

import { ADAPTIVE_PARAMS_FILE } from "./adaptive-params-file.mjs";
import { DEFAULT_ADAPTIVE_PARAMS } from "./default-adaptive-params.mjs";

export function loadAdaptiveParams() {
  try {
    if (existsSync(ADAPTIVE_PARAMS_FILE)) {
      // SONAR S7784: Use structuredClone instead of JSON.parse(JSON.stringify(...))
      const saved = JSON.parse(readFileSync(ADAPTIVE_PARAMS_FILE, "utf-8"));
      return structuredClone({ ...DEFAULT_ADAPTIVE_PARAMS, ...saved });
    }
  } catch {}
  return structuredClone(DEFAULT_ADAPTIVE_PARAMS);
}
