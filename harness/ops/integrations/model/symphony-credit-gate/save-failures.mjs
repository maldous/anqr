// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:562

import { writeFileSync } from "node:fs";

import { FAILURE_STATE_FILE } from "./failure-state-file.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";

export function saveFailures(failures) {
  ensureStateDir();
  writeFileSync(FAILURE_STATE_FILE, JSON.stringify(failures, null, 2));
}
