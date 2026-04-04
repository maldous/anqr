import { WORKTREE_BRANCH_PREFIX } from "./worktree-branch-prefix.mjs";

export function getWorktreeBranch(id) {
  if (!id) {
    throw new Error("Worktree ID is required");
  }
  return `${WORKTREE_BRANCH_PREFIX}${id}`;
}
