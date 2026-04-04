export const WORKTREE_IDS = String(process.env.SYMPHONY_AGENT_WORKTREES || "1,2,3,4,5,6,7,8")
  .split(",")
  .map((value) => Number.parseInt(value.trim(), 10))
  .filter((value) => Number.isFinite(value));
