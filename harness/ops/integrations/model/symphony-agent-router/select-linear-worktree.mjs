import { WORKTREES } from "./worktrees.mjs";

export function selectLinearWorktree() {
  const linearWorktrees = WORKTREES.filter((w) => w.id >= 1 && w.id <= 4);
  if (linearWorktrees.length === 0) return null;
  return [...linearWorktrees].sort((a, b) => a.activeRequests - b.activeRequests)[0];
}
