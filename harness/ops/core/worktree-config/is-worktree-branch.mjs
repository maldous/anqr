export function isWorktreeBranch(branch) {
  return /^symphony\/wt\d+$/.test(String(branch || ""));
}
