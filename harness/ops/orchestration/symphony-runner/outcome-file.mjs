import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";

/** Per-worktree outcome file path (lazy — reads WORKTREE_ID at call time). */
export function getOutcomeFile() {
  return resolve(STATE_DIR, `outcome-${WORKTREE_ID}.json`);
}
