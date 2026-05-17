export function resolveWorktreeStatus(wt) {
  if (!wt.healthy) return wt.state;
  return wt.executing ? "executing" : wt.state;
}
