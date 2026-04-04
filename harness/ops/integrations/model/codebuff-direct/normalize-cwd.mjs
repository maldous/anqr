export function normalizeCwd(cwd) {
  if (typeof cwd === "string" && cwd.trim()) return cwd.trim();
  return process.env.ANQR_WORKTREE_PATH || process.cwd();
}
