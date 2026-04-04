import { getWorktreePath } from "../../../core/worktree-config.mjs";

import { WORKTREE_IDS } from "./worktree-ids.mjs";

export const WORKTREES = WORKTREE_IDS.map((id) => ({
  id,
  path: getWorktreePath(id),
  port: 4320 + id,
  activeRequests: 0,
  failures: 0,
}));
