// Generated from ../../../scripts/ops/core/worktree-config.mjs:106

export function isWorktreeBranch(branch) {
  return /^symphony\/wt\d+$/.test(String(branch || ""));
}
