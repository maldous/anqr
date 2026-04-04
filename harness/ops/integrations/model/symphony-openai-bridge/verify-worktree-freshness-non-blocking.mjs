import { execSync } from "node:child_process";

import { BRIDGE_ROOT } from "./bridge-root.mjs";
import { IS_WORKTREE_BRIDGE } from "./is-worktree-bridge.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function verifyWorktreeFreshnessNonBlocking() {
  if (!IS_WORKTREE_BRIDGE) return;
  try {
    execSync("git fetch origin main", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 15000,
      stdio: "pipe",
    });
    const local = execSync("git rev-parse HEAD", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 5000,
      stdio: "pipe",
    }).trim();
    const remoteMain = execSync("git rev-parse origin/main", {
      cwd: BRIDGE_ROOT,
      encoding: "utf-8",
      timeout: 5000,
      stdio: "pipe",
    }).trim();
    if (local !== remoteMain) {
      logInfo(
        `ℹ️ Worktree not at latest main before request: local=${local.slice(0, 8)} main=${remoteMain.slice(0, 8)}`,
      );
    }
  } catch (err) {
    logWarn(`⚠️ Freshness check failed (non-fatal): ${err.message}`);
  }
}
