import { existsSync, readFileSync } from "node:fs";

import { getLockFile } from "./lock-file.mjs";
import { ROOT } from "./root.mjs";
import { RUN_ID } from "./run-id.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";
import { getWorkingTreeStatus } from "./get-working-tree-status.mjs";
import { isProcessAlive } from "./is-process-alive.mjs";
import { logInfo } from "./logger.mjs";

export function showStatus() {
  logInfo("[runner] Symphony Runner Status\n");
  logInfo(`  Worktree: ${WORKTREE_ID}`);
  logInfo(`  Root: ${ROOT}`);
  const LOCK_FILE = getLockFile();
  if (existsSync(LOCK_FILE)) {
    const pid = readFileSync(LOCK_FILE, "utf-8").trim();
    logInfo(`  Lock: ${isProcessAlive(Number(pid)) ? "🔒 LOCKED" : "🔓 stale"} (PID ${pid})`);
  } else {
    logInfo("  Lock: 🔓 available");
  }
  const workingTree = getWorkingTreeStatus();
  if (workingTree.blocked.length === 0 && workingTree.allowed.length === 0) {
    logInfo(`  Git clean: ✅`);
  } else if (workingTree.blocked.length === 0) {
    logInfo(
      `  Git clean: ⚠️ runtime-generated dirty paths ignored (${workingTree.allowed.length})`,
    );
  } else {
    logInfo(`  Git clean: ❌ (${workingTree.blocked.length} blocking path(s))`);
  }
  logInfo(`  LINEAR_API_KEY: ${process.env.LINEAR_API_KEY ? "✅" : "❌ not set"}`);
  logInfo(`  Run ID: ${RUN_ID}`);
}
