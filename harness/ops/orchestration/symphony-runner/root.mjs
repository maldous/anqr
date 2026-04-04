import { getWorktreePath } from "../../core/worktree-config.mjs";

import { WORKTREE_ID } from "./worktree-id.mjs";

export const ROOT =
  process.env.ANQR_WORKTREE_PATH || getWorktreePath(WORKTREE_ID.replace(/^wt/, ""));
