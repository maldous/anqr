import { writeFileSync } from "node:fs";

import { HEALTH_STATE_FILE } from "./health-state-file.mjs";
import { logWarn } from "./logger.mjs";

export function saveHealthState(state) {
  try {
    writeFileSync(HEALTH_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    logWarn(`Failed to save health state: ${err.message}`);
  }
}
