import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";

import { getLockFile } from "./lock-file.mjs";
import { ensureRuntimeStateDir } from "./ensure-runtime-state-dir.mjs";
import { isProcessAlive } from "./is-process-alive.mjs";

export function acquireLock() {
  ensureRuntimeStateDir();
  const LOCK_FILE = getLockFile();
  if (existsSync(LOCK_FILE)) {
    const existingPid = Number(readFileSync(LOCK_FILE, "utf-8").trim());
    if (existingPid && isProcessAlive(existingPid)) return false;
    unlinkSync(LOCK_FILE);
  }
  writeFileSync(LOCK_FILE, String(process.pid));
  return true;
}
