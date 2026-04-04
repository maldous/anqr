// Generated from ../../../scripts/ops/core/worktree-config.mjs:96

import { SYMPHONY_WORKTREE_IDS } from "./symphony-worktree-ids.mjs";

export function isSymphonyWorktree(worktreeId) {
  const normalizedId = String(worktreeId || "").replace(/^wt/, "");
  return SYMPHONY_WORKTREE_IDS.includes(normalizedId);
}
