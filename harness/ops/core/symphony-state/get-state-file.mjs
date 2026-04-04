// Generated from ../../../scripts/ops/core/symphony-state.mjs:27

import path from "node:path";

import { getStateDir } from "./get-state-dir.mjs";

export function getStateFile() {
  return path.join(getStateDir(), "state.json");
}
