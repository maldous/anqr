// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:554

import { readFileSync } from "node:fs";

import { FAILURE_STATE_FILE } from "./failure-state-file.mjs";

export function loadFailures() {
  try {
    return JSON.parse(readFileSync(FAILURE_STATE_FILE, "utf-8"));
  } catch {
    return {};
  }
}
