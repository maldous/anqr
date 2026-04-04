// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:193

import { resolve } from "node:path";

import { STATE_DIR } from "./state-dir.mjs";
import { WORKTREE_ID } from "./worktree-id.mjs";

export const SYNC_FAIL_COUNT_FILE = resolve(STATE_DIR, `sync-fail-${WORKTREE_ID}`);
