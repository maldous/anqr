import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";

export const LOCK_FILE = resolve(STATE_DIR, `lock-${WORKTREE_ID}`);
