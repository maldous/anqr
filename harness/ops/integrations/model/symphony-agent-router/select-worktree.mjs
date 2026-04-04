// Generated from ../../../../scripts/ops/integrations/model/symphony-agent-router.mjs:63

import { WORKTREES } from "./worktrees.mjs";
import { roundRobinIndex, setRoundRobinIndex } from "./round-robin-index.mjs";

export function selectWorktree(req, parsedBody) {
  const requestedWorktree =
    req.headers["x-worktree-id"] || parsedBody?.worktreeId || parsedBody?.worktree_id;
  if (requestedWorktree) {
    const normalized = String(requestedWorktree).replace(/^wt/, "");
    const found = WORKTREES.find((worktree) => String(worktree.id) === normalized);
    if (found) return found;
  }

  if (WORKTREES.length === 0) return null;

  // Find minimum load, then round-robin among equally-loaded worktrees
  const sorted = WORKTREES.slice().sort((a, b) => {
    if (a.activeRequests !== b.activeRequests) return a.activeRequests - b.activeRequests;
    return a.failures - b.failures;
  });
  const minLoad = sorted[0].activeRequests;
  const minFailures = sorted[0].failures;
  const candidates = sorted.filter(
    (wt) => wt.activeRequests === minLoad && wt.failures === minFailures,
  );

  const selected = candidates[roundRobinIndex % candidates.length];
  setRoundRobinIndex((roundRobinIndex + 1) % WORKTREES.length);
  return selected;
}
