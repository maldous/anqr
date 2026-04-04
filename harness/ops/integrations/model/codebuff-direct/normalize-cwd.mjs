// Generated from ../../../../scripts/ops/integrations/model/codebuff-direct.mjs:61

export function normalizeCwd(cwd) {
  if (typeof cwd === "string" && cwd.trim()) return cwd.trim();
  return process.env.ANQR_WORKTREE_PATH || process.cwd();
}
