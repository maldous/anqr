export const WORKTREE_IDS = (process.env.DISCORD_WORKTREES || "5,6,7,8")
  .split(",")
  .map((s) => Number.parseInt(s.trim(), 10))
  .filter((n) => !isNaN(n));
