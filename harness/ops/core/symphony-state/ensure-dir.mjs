// Generated from ../../../scripts/ops/core/symphony-state.mjs:41

import fs from "node:fs";

import { getStateDir } from "./get-state-dir.mjs";

export function ensureDir() {
  const stateDir = getStateDir();
  if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
}
