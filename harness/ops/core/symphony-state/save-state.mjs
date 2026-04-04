import fs from "node:fs";

import { ensureDir } from "./ensure-dir.mjs";
import { getStateFile } from "./get-state-file.mjs";

export function saveState(store) {
  ensureDir();
  const stateFile = getStateFile();
  store.updatedAt = new Date().toISOString();
  // Atomic write: temp file + rename prevents partial/corrupt state on crash or concurrent access
  const tmpFile = `${stateFile}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2) + "\n");
  fs.renameSync(tmpFile, stateFile);
}
