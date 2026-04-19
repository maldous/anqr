import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";

/**
 * Return the per-worktree lock file path.
 *
 * IMPORTANT: This MUST be a function (not a module-level constant)
 * because WORKTREE_ID is set lazily via setWorktreeId() at runtime.
 * A module-level `resolve(STATE_DIR, \`lock-${WORKTREE_ID}\`)` would
 * capture WORKTREE_ID as `undefined` before the runner calls
 * setWorktreeId(), causing ALL worktree runners to share a single
 * `lock-undefined` file and exit with EXIT_LOCK_CONTENTION.
 */
export function getLockFile() {
  return resolve(STATE_DIR, `lock-${WORKTREE_ID}`);
}
