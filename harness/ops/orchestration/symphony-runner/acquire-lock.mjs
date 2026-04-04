// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:295

import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";

import { LOCK_FILE } from "./lock-file.mjs";
import { ensureRuntimeStateDir } from "./ensure-runtime-state-dir.mjs";
import { isProcessAlive } from "./is-process-alive.mjs";

export function acquireLock() {
  ensureRuntimeStateDir();
  if (existsSync(LOCK_FILE)) {
    const existingPid = Number(readFileSync(LOCK_FILE, "utf-8").trim());
    if (existingPid && isProcessAlive(existingPid)) return false;
    unlinkSync(LOCK_FILE);
  }
  writeFileSync(LOCK_FILE, String(process.pid));
  return true;
}
