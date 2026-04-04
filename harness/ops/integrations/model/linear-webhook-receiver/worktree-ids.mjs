export const WORKTREE_IDS = (process.env.LINEAR_WORKTREES || "1,2,3,4")
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter((n) => !isNaN(n));
