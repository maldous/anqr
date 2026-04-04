// Generated from ../../../scripts/ops/orchestration/symphony-worktree-recovery.mjs:58

import { DISCORD_WORKTREE_IDS, SYMPHONY_WORKTREE_IDS } from "../../core/worktree-config.mjs";

export const ALL_WORKTREE_IDS = [
  ...SYMPHONY_WORKTREE_IDS.filter((id) => id !== "main"),
  ...DISCORD_WORKTREE_IDS,
];
