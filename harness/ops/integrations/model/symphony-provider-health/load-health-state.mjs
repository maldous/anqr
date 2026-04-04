// Generated from ../../../../scripts/ops/integrations/model/symphony-provider-health.mjs:72

import { readFileSync, existsSync } from "node:fs";

import { HEALTH_STATE_FILE } from "./health-state-file.mjs";
import { logWarn } from "./logger.mjs";

export function loadHealthState() {
  try {
    if (existsSync(HEALTH_STATE_FILE)) {
      return JSON.parse(readFileSync(HEALTH_STATE_FILE, "utf-8"));
    }
  } catch (err) {
    logWarn(`Failed to load health state: ${err.message}`);
  }
  return {};
}
