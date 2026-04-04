// Generated runtime carry-forward.
// Worktree detection extracted to detect-worktree.mjs.

import { existsSync, readFileSync, mkdirSync, statSync } from "node:fs";

import {
  ROOT,
  STATE_DIR,
  SYNC_FAIL_COUNT_FILE,
  WORKTREE_ID,
  cwd,
  gitPath,
  main,
  rootMatchesPattern,
} from "./index.mjs";

import { logWarn, logError, logDebug } from "./logger.mjs";
import { detectWorktree } from "./detect-worktree.mjs";
import { setWorktreeId } from "./worktree-id.mjs";
import { setAutoDetectedWorktreeId } from "./auto-detected-worktree-id.mjs";
import { setSyncFailCount } from "./sync-fail-count.mjs";

const detectedId = detectWorktree(cwd, gitPath);
if (detectedId) {
  setAutoDetectedWorktreeId(detectedId);
}

logDebug(
  `[worktree-debug] ANQR_WORKTREE_ID env var: ${process.env.ANQR_WORKTREE_ID || "(not set)"}`,
);

logDebug(`[worktree-debug] auto-detected ID: ${detectedId || "(none)"}`);

if (process.env.ANQR_WORKTREE_ID) {
  setWorktreeId(process.env.ANQR_WORKTREE_ID);
  logDebug(`[worktree-debug] Using WORKTREE_ID from env: ${WORKTREE_ID}`);
} else if (detectedId) {
  setWorktreeId(detectedId);
  logDebug(`[worktree-debug] Using auto-detected WORKTREE_ID: ${WORKTREE_ID}`);
} else {
  // Running in main repo without worktree context - NOT ALLOWED
  logError(
    `[runner] CRITICAL: Cannot run in main repo. Must run in a worktree (e.g., /home/user/src/anqr-wt1) or set ANQR_WORKTREE_ID environment variable.`,
  );
  logError(
    `[runner] Example: ANQR_WORKTREE_ID=wt1 node scripts/ops/orchestration/symphony-runner.mjs --once`,
  );
  process.exit(1);
}

logDebug(
  `[worktree-debug] ANQR_WORKTREE_PATH env var: ${process.env.ANQR_WORKTREE_PATH || "(not set)"}`,
);

logDebug(`[worktree-debug] Final ROOT directory: ${ROOT}`);

logDebug(`[worktree-debug] ROOT exists: ${existsSync(ROOT)}`);

logDebug(`[worktree-debug] ROOT is directory: ${existsSync(ROOT) && statSync(ROOT).isDirectory()}`);

logDebug(`[worktree-debug] ROOT matches worktree pattern: ${rootMatchesPattern}`);

if (!rootMatchesPattern && WORKTREE_ID !== "main") {
  logWarn(
    `[worktree-debug] WARNING: ROOT directory '${ROOT}' does not match expected worktree pattern`,
  );
}

if (!existsSync(STATE_DIR)) {
  mkdirSync(STATE_DIR, { recursive: true });
}

try {
  if (existsSync(SYNC_FAIL_COUNT_FILE)) {
    setSyncFailCount(Number(readFileSync(SYNC_FAIL_COUNT_FILE, "utf-8").trim()) || 0);
  }
} catch {
  setSyncFailCount(0);
}

await main();
