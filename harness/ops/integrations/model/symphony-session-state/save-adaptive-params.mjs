// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:113

import { writeFileSync } from "node:fs";

import { ADAPTIVE_PARAMS_FILE } from "./adaptive-params-file.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";

export function saveAdaptiveParams(params) {
  ensureStateDir();
  writeFileSync(ADAPTIVE_PARAMS_FILE, JSON.stringify(params, null, 2));
}
