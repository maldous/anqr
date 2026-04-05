import path from "node:path";

export function getProviderLeaseOwner() {
  const explicitId = process.env.ANQR_WORKTREE_ID;
  if (explicitId) return String(explicitId);
  const explicitPath = process.env.ANQR_WORKTREE_PATH;
  if (explicitPath) return path.basename(explicitPath);
  return `pid:${process.pid}`;
}
